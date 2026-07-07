import fs from 'fs';
import path from 'path';

const repos = ['../starlight-memory', '../starlight-evals'];

let pass = true;

function checkFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    
    // Check BOM
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        console.error(`FAIL: BOM found in ${filePath}`);
        pass = false;
    } else if (buffer.length >= 2 && ((buffer[0] === 0xFE && buffer[1] === 0xFF) || (buffer[0] === 0xFF && buffer[1] === 0xFE))) {
        console.error(`FAIL: UTF-16 BOM found in ${filePath}`);
        pass = false;
    }
    
    const content = buffer.toString('utf8');
    
    // Check LF (enforce LF means if there is any \r, it's a fail)
    if (content.includes('\r')) {
        console.error(`FAIL: CRLF or CR found in ${filePath} (must be strictly LF)`);
        pass = false;
    }
    
    // Check "Built on SIP"
    if (!content.includes('Built on SIP')) {
        console.error(`FAIL: Missing 'Built on SIP' in ${filePath}`);
        pass = false;
    }
}

function traverseDir(dir) {
    if (!fs.existsSync(dir)) {
        console.warn(`WARN: Directory ${dir} does not exist. Skipping.`);
        return;
    }
    const files = fs.readdirSync(dir);
    for (const file of files) {
        // Skip common ignored directories
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (file.endsWith('.md')) {
            checkFile(fullPath);
        }
    }
}

console.log('--- Cross-Repo Audit ---');
for (const repo of repos) {
    const repoPath = path.resolve(process.cwd(), repo);
    console.log(`Auditing: ${repoPath}`);
    traverseDir(repoPath);
}

if (pass) {
    console.log('--- RESULT: PASS ---');
    process.exit(0);
} else {
    console.log('--- RESULT: FAIL ---');
    process.exit(1);
}
