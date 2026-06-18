import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CREDENTIALS_PATH = 'C:/Users/frank/.claude/.credentials.json';
const LEDGER_PATH = 'C:/Users/frank/starlight/higgsfield/ledger.jsonl';

// Utility: get absolute path of credentials
function getHiggsfieldCreds() {
  if (!existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Credentials file not found at ${CREDENTIALS_PATH}`);
  }
  const creds = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
  const mcpOAuth = creds.mcpOAuth || {};
  const hKey = Object.keys(mcpOAuth).find(k => mcpOAuth[k].serverName === 'higgsfield');
  if (!hKey) {
    throw new Error("No Higgsfield OAuth section found in credentials!");
  }
  return { creds, hKey, credentials: mcpOAuth[hKey] };
}

// OAuth Token Auto-Refresh
async function ensureValidToken() {
  const { creds, hKey, credentials } = getHiggsfieldCreds();
  
  // Check if token expires in less than 5 minutes (300000ms) or is already expired
  const isExpired = !credentials.expiresAt || (Date.now() + 300000 >= credentials.expiresAt);
  if (!isExpired) {
    return credentials.accessToken;
  }

  console.log("[SVD] Access token expired or close to expiry. Refreshing...");
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', credentials.clientId);
  params.append('refresh_token', credentials.refreshToken);

  const res = await fetch('https://mcp.higgsfield.ai/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!res.ok) {
    throw new Error(`[SVD] OAuth token refresh failed (HTTP ${res.status}): ${await res.text()}`);
  }

  const tokenData = await res.json();
  credentials.accessToken = tokenData.access_token;
  if (tokenData.refresh_token) credentials.refreshToken = tokenData.refresh_token;
  if (tokenData.expires_in) {
    credentials.expiresAt = Date.now() + tokenData.expires_in * 1000;
  }

  creds.mcpOAuth[hKey] = credentials;
  writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), 'utf8');
  console.log(`[SVD] OAuth token successfully refreshed. Expires at: ${new Date(credentials.expiresAt).toISOString()}`);
  return credentials.accessToken;
}

// Call Higgsfield MCP JSON-RPC Server
async function callHiggsfield(toolName, args = {}) {
  const accessToken = await ensureValidToken();
  const { credentials } = getHiggsfieldCreds();

  const payload = {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args
    },
    id: 1
  };

  let attempt = 0;
  const maxRetry = 3;
  let delay = 2000;

  while (true) {
    try {
      const res = await fetch(credentials.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if ([502, 503, 504].includes(res.status) && attempt < maxRetry) {
          attempt++;
          console.warn(`[SVD] Server returned ${res.status}. Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxRetry})...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
      }

      const text = await res.text();
      const lines = text.split('\n');
      let dataBuffer = '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          dataBuffer += line.slice(6);
        }
      }
      return JSON.parse(dataBuffer.trim());
    } catch (e) {
      if (attempt < maxRetry) {
        attempt++;
        console.warn(`[SVD] Network error: ${e.message}. Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxRetry})...`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw e;
    }
  }
}

// 7-Gate Visual Quality Council Evaluator
function evaluatePromptText(promptText) {
  const issues = [];
  const checks = {
    hasConcept: /concept/i.test(promptText),
    hasMetaphor: /metaphor/i.test(promptText),
    hasStyleDNA: /(style|dna)/i.test(promptText),
    hasOrganicAnchor: /organic anchor/i.test(promptText),
    hasAtmosphere: /atmosphere/i.test(promptText),
  };

  // Check components count
  const compMatches = promptText.match(/(\d\.\s*THE\s+|COMPONENTS:)/gi) || [];
  const hasMinComponents = compMatches.length >= 4 || promptText.includes('COMPONENTS:');

  // Forbidden slop keywords check
  const forbidden = ['photorealistic', 'hyperdetailed', 'hyper-realistic', 'neon gradient', 'ai slop', 'trending on artstation'];
  const foundForbidden = forbidden.filter(word => promptText.toLowerCase().includes(word));

  let score = 10.0;
  if (!checks.hasConcept) { score -= 1.0; issues.push("Missing CONCEPT block"); }
  if (!checks.hasMetaphor) { score -= 1.5; issues.push("Missing ORGANIZING METAPHOR"); }
  if (!checks.hasStyleDNA) { score -= 1.0; issues.push("Missing STYLE DNA block"); }
  if (!checks.hasOrganicAnchor) { score -= 1.5; issues.push("Missing ORGANIC ANCHOR"); }
  if (!checks.hasAtmosphere) { score -= 1.0; issues.push("Missing ATMOSPHERE directive"); }
  if (!hasMinComponents) { score -= 1.5; issues.push("Lists fewer than 4 distinct structural components"); }
  if (foundForbidden.length > 0) {
    score -= foundForbidden.length * 1.0;
    issues.push(`Contains forbidden slop terms: [${foundForbidden.join(', ')}]`);
  }
  if (promptText.length < 150) {
    score -= 1.5;
    issues.push("Prompt content is too short for premium generation details");
  }

  score = Math.max(1.0, parseFloat(score.toFixed(2)));

  return {
    score,
    approved: score >= 8.0,
    issues
  };
}

// Helper: Download a file
async function downloadFile(url, destPath) {
  const dir = dirname(destPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(destPath, buffer);
  console.log(`[SVD] ✓ Downloaded asset: ${destPath} (${buffer.length} bytes)`);
}

// Helper: Get PNG dimensions
function getPngDimensions(filePath) {
  const buf = readFileSync(filePath);
  if (buf.readUInt32BE(0) !== 0x89504E47) {
    throw new Error(`File at ${filePath} is not a valid PNG image.`);
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

// Polling wrapper
async function pollJob(jobId, maxAttempts = 60) {
  let completed = false;
  let attempts = 0;
  let resultUrl = '';
  
  while (!completed && attempts < maxAttempts) {
    attempts++;
    console.log(`[SVD] Polling job status (Attempt ${attempts}/${maxAttempts})...`);
    const statusRes = await callHiggsfield('job_status', { jobId: jobId });
    
    const sc = statusRes.result?.structuredContent || {};
    const status = sc.generation?.status || sc.status || statusRes.result?.status || 'unknown';
    console.log(`[SVD] Current Status: ${status}`);
    
    if (status === 'completed' || status === 'success' || statusRes.result?.content?.[0]?.text?.includes('completed') || statusRes.result?.content?.[0]?.text?.includes('success')) {
      completed = true;
      resultUrl = sc.result_url || sc.results?.[0]?.url || sc.url || statusRes.result?.url;
      if (!resultUrl && sc.results && Array.isArray(sc.results)) {
        resultUrl = typeof sc.results[0] === 'string' ? sc.results[0] : sc.results[0].url;
      }
      if (!resultUrl && statusRes.result?.content) {
        const text = statusRes.result.content[0]?.text || '';
        const match = text.match(/https?:\/\/[^\s"'`]+/i);
        if (match) resultUrl = match[0];
      }
      break;
    } else if (status === 'failed' || statusRes.result?.content?.[0]?.text?.includes('failed')) {
      throw new Error(`Higgsfield server reported job failure: ${sc.fail_reason || sc.error || statusRes.result?.content?.[0]?.text}`);
    }

    const delay = sc.poll_after_seconds || 8;
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
  }

  if (!completed || !resultUrl) {
    throw new Error(`Job ${jobId} timed out after ${attempts} attempts`);
  }

  return resultUrl;
}

// Log into ledger
function logLedger(entry) {
  const ledgerEntry = {
    timestamp: new Date().toISOString(),
    ...entry
  };
  appendFileSync(LEDGER_PATH, JSON.stringify(ledgerEntry) + '\n');
  console.log(`[SVD] ✓ Job logged in ledger.jsonl`);
}

// Commands
async function compileBrief(brand, placement, rawPrompt, model) {
  console.log(`[SVD] Compiling brief for ${brand.toUpperCase()} - ${placement}...`);
  const briefFolder = `C:/Users/frank/starlight/higgsfield/experiments`;
  if (!existsSync(briefFolder)) mkdirSync(briefFolder, { recursive: true });
  
  const fileName = `${brand}-${placement}.md`;
  const briefPath = join(briefFolder, fileName);

  const evalResult = evaluatePromptText(rawPrompt);
  console.log(`[SVD] Simulated Council Score: ${evalResult.score}/10`);
  if (!evalResult.approved) {
    console.warn("[SVD] ⚠️ WARNING: Prompt did not pass the Council quality check!");
    console.warn("[SVD] Issues found:\n" + evalResult.issues.map(i => ` - ${i}`).join('\n'));
  } else {
    console.log("[SVD] ✓ Prompt passed Visual Quality Council checks.");
  }

  const fileContent = `# Experiment Brief: ${brand.toUpperCase()} ${placement}
> Brand: ${brand.toUpperCase()}
> Model Route: ${model}
> Target Ratio: 16:9
> Council Score: ${evalResult.score}/10

---

${rawPrompt}`;

  writeFileSync(briefPath, fileContent, 'utf8');
  console.log(`[SVD] Brief written to: ${briefPath}`);
  return { briefPath, evalResult };
}

async function runCostPreflight(model, promptText, isVideo = false, startImageId = null) {
  console.log(`[SVD] Running cost preflight for model: ${model}...`);
  
  const method = isVideo ? 'generate_video' : 'generate_image';
  const args = {
    params: {
      model: model,
      prompt: promptText,
      get_cost: true
    }
  };

  if (isVideo) {
    args.params.aspect_ratio = '16:9';
    args.medias = [
      {
        role: 'start_image',
        value: startImageId
      }
    ];
  } else {
    args.params.aspect_ratio = '16:9';
    args.params.image_size = '1K';
  }

  const res = await callHiggsfield(method, args);
  const sc = res.result?.structuredContent || {};
  const cost = sc.cost?.credits || sc.cost?.credits_exact || 1.0;
  console.log(`[SVD] Preflight Cost Check: ${cost} credits.`);
  return cost;
}

async function generateAsset(brand, briefPath, model, outName, isVideo = false, startImageId = null) {
  const prompt = readFileSync(briefPath, 'utf8');
  
  // Cost preflight
  const cost = await runCostPreflight(model, prompt, isVideo, startImageId);
  
  console.log(`[SVD] Submitting generation job for ${outName}...`);
  const method = isVideo ? 'generate_video' : 'generate_image';
  const args = {
    params: {
      model: model,
      prompt: prompt,
      aspect_ratio: '16:9'
    }
  };

  if (isVideo) {
    args.medias = [
      {
        role: 'start_image',
        value: startImageId
      }
    ];
  } else {
    args.params.image_size = '1K';
  }

  const submitRes = await callHiggsfield(method, args);
  let jobId;
  const sc = submitRes.result?.structuredContent || {};
  
  if (sc.results && Array.isArray(sc.results) && sc.results.length > 0) {
    jobId = sc.results[0].id || sc.results[0].job_id;
  }
  if (!jobId) jobId = sc.job_id || sc.id;
  if (!jobId && submitRes.result?.content) {
    const text = submitRes.result.content[0]?.text || '';
    const match = text.match(/job_id:\s*([a-f0-9\-]+)/i) || text.match(/id:\s*([a-f0-9\-]+)/i);
    if (match) jobId = match[1];
  }

  if (!jobId) {
    throw new Error(`Failed to extract job ID. Response: ${JSON.stringify(submitRes)}`);
  }

  console.log(`[SVD] Job submitted. ID: ${jobId}. Polling...`);
  const resultUrl = await pollJob(jobId);
  console.log(`[SVD] Job completed! URL: ${resultUrl}`);

  const localDest = `C:/Users/frank/starlight/higgsfield/assets/${brand}/${outName}`;
  await downloadFile(resultUrl, localDest);

  logLedger({
    job_id: jobId,
    repo: brand === 'frankx' ? 'FrankX' : (brand === 'arcanea' ? 'arcanea-ai-app' : 'Starlight-Intelligence-System'),
    brand: brand.toUpperCase(),
    purpose: isVideo ? `Concept Video: ${outName}` : `Concept Generation: ${outName}`,
    model: model,
    prompt_path: briefPath,
    cost: cost,
    result_url: resultUrl,
    next_action: isVideo ? 'None' : 'Upscale if selected as winner'
  });


  return { jobId, localDest, resultUrl };
}

async function upscaleAsset(brand, jobId, localImgPath, outName) {
  console.log(`[SVD] Upscaling job ${jobId} (derived from ${localImgPath}) to 4K...`);
  const { width, height } = getPngDimensions(localImgPath);
  console.log(`[SVD] Dimensions parsed: ${width}x${height}`);

  // Preflight
  const preflightRes = await callHiggsfield('upscale_image', {
    params: {
      provider: 'bytedance',
      image_id: jobId,
      width,
      height,
      resolution: '4k',
      get_cost: true
    }
  });
  const scPre = preflightRes.result?.structuredContent || {};
  const cost = scPre.cost?.credits || 2.0;
  console.log(`[SVD] Preflight upscale cost: ${cost} credits.`);

  // Submit
  const submitRes = await callHiggsfield('upscale_image', {
    params: {
      provider: 'bytedance',
      image_id: jobId,
      width,
      height,
      resolution: '4k'
    }
  });

  let upscaleJobId;
  const sc = submitRes.result?.structuredContent || {};
  if (sc.results && Array.isArray(sc.results) && sc.results.length > 0) {
    upscaleJobId = sc.results[0].id || sc.results[0].job_id;
  }
  if (!upscaleJobId) upscaleJobId = sc.job_id || sc.id;

  if (!upscaleJobId) {
    throw new Error(`Failed to submit upscale. Response: ${JSON.stringify(submitRes)}`);
  }

  console.log(`[SVD] Upscale submitted. ID: ${upscaleJobId}. Polling...`);
  const resultUrl = await pollJob(upscaleJobId, 90); // upscale takes longer
  console.log(`[SVD] Upscale completed! URL: ${resultUrl}`);

  const localDest = `C:/Users/frank/starlight/higgsfield/assets/${brand}/${outName}`;
  await downloadFile(resultUrl, localDest);

  logLedger({
    job_id: upscaleJobId,
    repo: brand === 'frankx' ? 'FrankX' : (brand === 'arcanea' ? 'arcanea-ai-app' : 'Starlight-Intelligence-System'),
    brand: brand.toUpperCase(),
    purpose: `Upscaled 4K: ${outName}`,
    model: 'upscale_image',
    prompt_path: localImgPath,
    cost: cost,
    result_url: resultUrl,
    next_action: 'None'
  });

  return { upscaleJobId, localDest, resultUrl };
}

async function auditVideo(videoJobId) {
  console.log(`[SVD] Running neuro-engagement/virality analysis for video: ${videoJobId}...`);
  const result = await callHiggsfield('virality_predictor', {
    action: 'create',
    params: {
      model: 'virality_predictor',
      medias: [{ role: 'video', id: videoJobId }]
    }
  });

  const sc = result.result?.structuredContent || {};
  const auditJobId = sc.job_id || sc.id;
  if (!auditJobId) {
    throw new Error(`Failed to submit virality check. Response: ${JSON.stringify(result)}`);
  }

  console.log(`[SVD] Virality audit submitted. ID: ${auditJobId}. Polling...`);
  const resultUrl = await pollJob(auditJobId, 60);

  // Poll for the actual scorecard values
  const statusRes = await callHiggsfield('job_status', { jobId: auditJobId });
  const statusSc = statusRes.result?.structuredContent || {};
  const analysis = statusSc.generation?.params?.analysis || statusSc.generation?.analysis || statusSc.analysis || {};
  const scores = analysis.scores || {};

  console.log(`\n====================================================`);
  console.log(`NEURO-ENGAGEMENT AUDIT SCORECARD`);
  console.log(`====================================================`);
  console.log(`- Overall Score:        ${scores.overall_score || 0}/100`);
  console.log(`- Hook Score (0-3s):    ${scores.hook_score || 0}/100`);
  console.log(`- Sustain Score:        ${scores.sustain || 0}/100`);
  console.log(`- Viral Potential:      ${scores.viral_potential || 0}/100`);
  console.log(`- Brain Engagement:     ${scores.brain_engagement || 0}/100`);
  
  if (analysis.regions) {
    console.log(`----------------------------------------------------`);
    console.log(`Cortical Region Activation Details:`);
    for (const reg of analysis.regions) {
      console.log(` - ${reg.title} (${reg.subtitle}): Mean: ${(reg.mean_score * 100).toFixed(1)}% | Peak: ${(reg.peak_score * 100).toFixed(1)}%`);
    }
  }
  console.log(`----------------------------------------------------`);
  console.log(`Result HTML Report: ${resultUrl}`);
  console.log(`====================================================\n`);

  logLedger({
    job_id: auditJobId,
    repo: 'arcanea-ai-app',
    brand: 'ARCANEA',
    purpose: `Virality Analysis: ${videoJobId}`,
    model: 'brain_activity',
    prompt_path: videoJobId,
    cost: 0.0,
    result_url: resultUrl,
    next_action: 'None'
  });

  return { scores, analysis, resultUrl };
}

// Master CLI Execution Router
async function run() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`Usage: node visual-director.mjs <command> [options]
Commands:
  compile --brand <brand> --placement <placement> --prompt <prompt_text> --model <model>
  preflight --brand <brand> --placement <placement> --prompt <prompt_text> --model <model>
  generate --brand <brand> --placement <placement> --brief <brief_path> --model <model> --out <filename> [--video] [--start-image <id>]
  upscale --brand <brand> --job <job_id> --file <local_path> --out <filename>
  audit --job <video_job_id>
  run-e2e --brand <brand> --placement <placement> --prompt <prompt_text> --img-model <model> --vid-model <model>
`);
    process.exit(0);
  }

  // Parse key-value args
  const parsed = {};
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const val = args[i + 1];
    parsed[key] = val;
  }

  if (command === 'compile') {
    const { brand, placement, prompt, model } = parsed;
    if (!brand || !placement || !prompt || !model) throw new Error("Missing parameters for compile.");
    await compileBrief(brand, placement, prompt, model);
  } 
  else if (command === 'preflight') {
    const { brand, placement, prompt, model } = parsed;
    if (!brand || !placement || !prompt || !model) throw new Error("Missing parameters for preflight.");
    const { briefPath } = await compileBrief(brand, placement, prompt, model);
    const compiledPrompt = readFileSync(briefPath, 'utf8');
    await runCostPreflight(model, compiledPrompt);
  } 
  else if (command === 'generate') {
    const { brand, brief, model, out, video, 'start-image': startImage } = parsed;
    if (!brand || !brief || !model || !out) throw new Error("Missing parameters for generate.");
    const isVid = video !== undefined;
    await generateAsset(brand, brief, model, out, isVid, startImage);
  } 
  else if (command === 'upscale') {
    const { brand, job, file, out } = parsed;
    if (!brand || !job || !file || !out) throw new Error("Missing parameters for upscale.");
    await upscaleAsset(brand, job, file, out);
  } 
  else if (command === 'audit') {
    const { job } = parsed;
    if (!job) throw new Error("Missing job parameter for audit.");
    await auditVideo(job);
  } 
  else if (command === 'run-e2e') {
    const { brand, placement, prompt, 'img-model': imgModel, 'vid-model': vidModel } = parsed;
    if (!brand || !placement || !prompt || !imgModel || !vidModel) {
      throw new Error("Missing parameters for run-e2e. Required: --brand, --placement, --prompt, --img-model, --vid-model");
    }

    console.log(`\n[SVD] === STARTING E2E AUTO-DIRECTOR RUN FOR: ${brand.toUpperCase()} - ${placement} ===`);
    
    // 1. Compile and review prompt
    const { briefPath } = await compileBrief(brand, placement, prompt, imgModel);
    
    // 2. Generate still image
    const stillName = `${placement}_premium.png`;
    console.log(`\n[SVD] --- STEP 1: Generating Still (${stillName}) ---`);
    const stillRes = await generateAsset(brand, briefPath, imgModel, stillName, false);
    
    // 3. Upscale still image to 4K
    const upscaleName = `${placement}_premium_upscaled.png`;
    console.log(`\n[SVD] --- STEP 2: Upscaling Still to 4K (${upscaleName}) ---`);
    const upscaleRes = await upscaleAsset(brand, stillRes.jobId, stillRes.localDest, upscaleName);

    // 4. Generate video loop from still
    const videoName = `${placement}_premium.mp4`;
    console.log(`\n[SVD] --- STEP 3: Generating Video Loop from Still (${videoName}) ---`);
    const vidRes = await generateAsset(brand, briefPath, vidModel, videoName, true, stillRes.jobId);

    // 5. Audit video loop
    console.log(`\n[SVD] --- STEP 4: Performing Neuro-Engagement Audit ---`);
    const auditRes = await auditVideo(vidRes.jobId);

    console.log(`[SVD] === E2E AUTO-DIRECTOR RUN COMPLETED SUCCESSFULLY ===\n`);
  }
  else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error("[SVD] [FATAL ERROR]:", err.message);
  process.exit(1);
});
