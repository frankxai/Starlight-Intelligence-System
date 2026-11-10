/** Local deterministic example adapter; no network, model, publish or payment calls. */
export function draftStep(id, brief, documents) {
  switch (id) {
    case 'brief': return { markdown: `# Founder brief\n\nCompany: ${brief.company}\n\nCustomer: ${brief.customer}\n\nProblem: ${brief.problem}\n\nDesired outcome: ${brief.outcome}\n\nEvidence: ${brief.evidenceStatus}\n` };
    case 'offer': return { markdown: `# Offer draft\n\n## Who it helps\n${brief.customer}.\n\n## What they leave with\n${brief.outcome}.\n\n## Scope to confirm\n- One interview to understand the customer's work.\n- One clear offer with boundaries and delivery steps.\n- One landing page and launch checklist.\n\n## Founder decisions\n- Validate willingness to pay in three customer conversations.\n- Set price, delivery time and revision limits.\n- Replace assumptions with interview evidence.\n` };
    case 'landing': return { markdown: `# Landing page draft\n\n## Turn your expertise into an offer people understand\nFor ${brief.customer.toLowerCase()}.\n\nYou know your craft. Let's make the next step clear: ${brief.outcome.toLowerCase()}.\n\n## What we make together\n- A focused offer with a clear outcome.\n- A page that explains who it helps and how.\n- A short plan for the first conversations.\n\n## Start with a conversation\n[Add your booking link after review]\n\nDraft only. Confirm delivery promises, price and customer evidence before publishing.\n` };
    case 'choose-channel': return { markdown: `# Channel decision\n\nSelected: ${brief.channel}\n\nSource: pinned founder brief. This is a deterministic preference, not an assessed marketing recommendation.\n`, route: brief.channel };
    case 'web-plan': return { markdown: '# Web launch checklist\n\n- [ ] Validate the offer in three conversations.\n- [ ] Add a real booking destination.\n- [ ] Review mobile layout and form accessibility.\n- [ ] Confirm privacy and analytics settings.\n- [ ] Obtain the founder\'s approval before publication.\n' };
    case 'community-plan': return { markdown: '# Community launch checklist\n\n- [ ] Select a community where the founder already contributes.\n- [ ] Read its promotion rules.\n- [ ] Share a useful example and invite feedback.\n- [ ] Obtain approval before posting or contacting anyone.\n' };
    case 'assemble': return { markdown: `# Founder launch kit\n\nStatus: editable draft; not published.\n\n${['brief', 'offer', 'landing', 'web-plan', 'community-plan'].filter(key => documents.has(key)).map(key => documents.get(key).markdown).join('\n---\n\n')}` };
    case 'evaluate': {
      const kit = documents.get('assemble')?.markdown ?? '';
      const checks = [kit.includes(brief.customer), kit.includes('# Offer draft'), kit.includes('# Landing page draft'), kit.includes('not published'), kit.includes('approval before')];
      return { markdown: `# Draft quality review\n\n${checks.map((pass, index) => `- ${pass ? 'PASS' : 'FAIL'} structural check ${index + 1}`).join('\n')}\n\nThese checks establish document structure only. They do not validate market demand, copy quality or business results.\n`, verdict: checks.every(Boolean) ? 'pass' : 'fail' };
    }
    case 'export': return { markdown: `${documents.get('assemble').markdown}\n\nHost approval verified for this exact artifact. Export does not publish it.\n` };
    default: throw new Error('Unrecognized example step.');
  }
}
