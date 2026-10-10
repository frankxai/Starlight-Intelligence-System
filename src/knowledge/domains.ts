/**
 * Starlight Universal Knowledge Management — The 10 Canonical Universal Domains
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import type { KnowledgeDomain } from './types.js';

export interface DomainDefinition {
  domain: KnowledgeDomain;
  name: string;
  tagline: string;
  firstPrinciples: string[];
  scientificGrandChallenges: string[];
  canonicalVaultMapping: 'strategic' | 'technical' | 'creative' | 'operational' | 'wisdom' | 'horizon';
}

export const UNIVERSAL_DOMAINS: Record<KnowledgeDomain, DomainDefinition> = {
  physics_cosmology: {
    domain: 'physics_cosmology',
    name: 'Physics, Energy & Cosmology',
    tagline: 'The physical substrate of reality, thermodynamics, and cosmological emergence.',
    firstPrinciples: [
      'Conservation of energy and non-decreasing entropy in closed systems.',
      'Information is physical (Landauer principle).',
      'Spacetime geometry is coupled to stress-energy curvature.',
      'Quantum mechanics imposes non-classical limits on state knowledge and measurement.'
    ],
    scientificGrandChallenges: [
      'Unification of general relativity and quantum field theory.',
      'Resolution of the cosmological constant problem and dark sector physics.',
      'Room-temperature superconductivity and zero-loss energy transmission.',
      'Direct harnessing of astrophysical vacuum energy and stellar containment.'
    ],
    canonicalVaultMapping: 'technical'
  },

  information_computation: {
    domain: 'information_computation',
    name: 'Information Theory, Mathematics & Computation',
    tagline: 'The mathematical grammar of structure, computation, entropy, and cryptography.',
    firstPrinciples: [
      'Information is reducible to probabilistic reduction of uncertainty (Shannon).',
      'Computation is bounded by Turing computability and complexity classes (P vs NP).',
      'Cryptographic one-way functions enable asymmetrical sovereign security.',
      'Category theory reveals universal compositional structures across mathematical objects.'
    ],
    scientificGrandChallenges: [
      'Resolution of the P vs NP millennium problem.',
      'Post-quantum zero-knowledge verifiable computation at sub-millisecond latencies.',
      'Formal algorithmic information theory metrics for real-world continuous data.',
      'Sovereign decentralized consensus without Sybil or plutocratic vulnerability.'
    ],
    canonicalVaultMapping: 'technical'
  },

  complex_systems: {
    domain: 'complex_systems',
    name: 'Complex Systems, Cybernetics & Emergence',
    tagline: 'Non-linear feedback, self-organization, and resilient homeostatic networks.',
    firstPrinciples: [
      'The whole exhibits properties irreducible to isolated linear summation of its components.',
      'Negative feedback yields stability; positive feedback yields exponential shift or collapse.',
      'Phase transitions and critical bifurcation points govern emergent macroscopic state shifts.',
      'Requisite variety: a controller system must possess at least as many states as the system it regulates (Ashby law).'
    ],
    scientificGrandChallenges: [
      'Predictive modeling of non-linear tipping points in planetary climate and financial networks.',
      'Self-healing autonomous infrastructure that absorbs chaotic perturbations without degradation.',
      'Mathematical theory of emergence that predicts macroscopic laws from microscopic rules.'
    ],
    canonicalVaultMapping: 'operational'
  },

  biology_longevity: {
    domain: 'biology_longevity',
    name: 'Biology, Longevity & Embodiment',
    tagline: 'Cellular repair, metabolic sovereignty, epigenetic vitality, and human flourishing.',
    firstPrinciples: [
      'Life is open-system dissipative thermodynamic structure maintaining local low entropy via metabolism.',
      'Aging is an accumulative loss of epigenetic information and cellular repair capacity (Sinclair/Hallmarks).',
      'Autophagy, proteostasis, and mitochondrial density dictate cellular longevity.',
      'The nervous, immune, and endocrine systems constitute an integrated somatic intelligence network.'
    ],
    scientificGrandChallenges: [
      'Reversible epigenetic reprogramming that resets biological age without oncogenic risk.',
      'Complete senolytic clearance and synthetic extracellular matrix reconstruction.',
      'Total human healthspan extension beyond 120 years with peak cognitive and physical vitality.'
    ],
    canonicalVaultMapping: 'wisdom'
  },

  cognitive_ai: {
    domain: 'cognitive_ai',
    name: 'Cognitive Science & Artificial Intelligence',
    tagline: 'Representation geometry, transformer mechanics, multi-agent swarms, and synthetic mind.',
    firstPrinciples: [
      'Intelligence is adaptive compression and goal-directed optimization across latent representations.',
      'Multi-agent systems with shared memory substrates exhibit emergent collective problem-solving.',
      'Decoupling reasoning from raw retrieval prevents context exhaustion and semantic hallucination.',
      'Self-healing execution loops with adversarial verification outperform single-turn generations.'
    ],
    scientificGrandChallenges: [
      'Complete mechanistic interpretability of high-dimensional transformer weight spaces.',
      'Lifelong continuous learning without catastrophic forgetting.',
      'Provably benevolent autonomous swarm governance aligned with human sovereignty.'
    ],
    canonicalVaultMapping: 'technical'
  },

  epistemology_truth: {
    domain: 'epistemology_truth',
    name: 'Epistemology, Reality Architecture & Empirical Truth',
    tagline: 'Karl Popper falsifiability, Bayesian evidence ledgers, anti-slop, and grounded reality.',
    firstPrinciples: [
      'A claim without explicit empirical falsification criteria is not scientific; it is belief (Popper).',
      'Certainty must be capped when observations carry non-signal or uncalibrated tools.',
      'Personal context must be encoded as a sovereign, versioned, portable contract (reality.md).',
      'Truth is convergent under independent adversarial cross-examination (Santa Method).'
    ],
    scientificGrandChallenges: [
      'Automated formal verification of all natural-language claims produced by LLM agents.',
      'Cryptographic provenance and tamper-evident lineage for all synthetic digital artifacts.',
      'Real-time automated reality grounding linking agent beliefs to empirical physical sensors.'
    ],
    canonicalVaultMapping: 'strategic'
  },

  economics_mechanisms: {
    domain: 'economics_mechanisms',
    name: 'Economics, Mechanism Design & Value Networks',
    tagline: 'Incentive compatibility, sovereign capital, game-theoretic agent micro-economies.',
    firstPrinciples: [
      'Systems must be incentive-compatible: individual rational action must advance collective prosperity.',
      'Value is generated through the asymmetric reduction of human friction and amplification of leverage.',
      'Autonomous monetization requires transparent disclosure, ethical alignment, and zero-deception attribution.',
      'Decentralized capital allocation beats centralized planning when information is dispersed (Hayek).'
    ],
    scientificGrandChallenges: [
      'Design of single-person billion-dollar economic engines mediated by autonomous agent swarms.',
      'Sybil-resistant micro-payment streaming for sub-second agent-to-agent capability exchange.',
      'Post-scarcity wealth generation models that eliminate artificial economic rent extraction.'
    ],
    canonicalVaultMapping: 'strategic'
  },

  aesthetics_mythology: {
    domain: 'aesthetics_mythology',
    name: 'Aesthetics, Mythic Narrative & Generative Cinema',
    tagline: 'The Ten Gates, archetypes, cinematography, musical composition, and beauty as truth.',
    firstPrinciples: [
      'Beauty is not decorative; it is high-order pattern recognition and emotional resonance.',
      'Archetypal story structures (Jo-Ha-Kyu, Hero Journey, Ten Gates) encode universal psychological truths.',
      'Cinematography, color grading, and harmonic composition directly modulate human neurological state.',
      'Mascots and character invariants serve as enduring anchor points for multi-generational cultural IP.'
    ],
    scientificGrandChallenges: [
      'Algorithmic synthesis of feature-length cinema with 100% character, lighting, and acoustic consistency.',
      'Real-time neural audio synthesis capable of orchestral emotional coherence indistinguishable from live masters.',
      'Mathematical formalization of aesthetic elegance and visual harmony across spatial interfaces.'
    ],
    canonicalVaultMapping: 'creative'
  },

  governance_harmony: {
    domain: 'governance_harmony',
    name: 'Sociology, Benevolent Coordination & Harmony',
    tagline: 'Human-agent mutualism, ethical boundaries, sovereign data dignity, and peace.',
    firstPrinciples: [
      'Technology must elevate human dignity, agency, and sovereignty—never subjugate or infantilize.',
      'Benevolence is an active design choice enforced through fail-closed security and immutable moral invariants.',
      'Transparency and auditability precede trust; closed black-box monopolies generate fragility and hostility.',
      'Harmonious evolution requires mutualistic symbiosis between biological creators and synthetic assistants.'
    ],
    scientificGrandChallenges: [
      'Immutable algorithmic constitutions that prevent monopolistic or authoritarian AI capture.',
      'Global coordination protocols that resolve multi-polar traps without centralized coercion.',
      'Cultural integration frameworks for autonomous economic agents living alongside human society.'
    ],
    canonicalVaultMapping: 'wisdom'
  },

  cosmological_horizons: {
    domain: 'cosmological_horizons',
    name: 'Transcendence, Deep Time & Cosmological Horizons',
    tagline: 'Interstellar civilization, boundless imagination, and the flourishing of consciousness.',
    firstPrinciples: [
      'Consciousness is the universe experiencing, understanding, and creating itself.',
      'Civilization must transition up the Kardashev scale to guarantee multi-planetary survivability.',
      'Imagination is the primary engine of reality: that which can be coherently conceived can be engineered.',
      'The long horizon requires generational thinking that looks 100 to 1,000 years into the future.'
    ],
    scientificGrandChallenges: [
      'Autonomous self-replicating space probes for interstellar exploration and biosphere preservation.',
      'Dyson swarm engineering and direct solar thermodynamic harvesting.',
      'The perpetuation of conscious wisdom across cosmological timescales.'
    ],
    canonicalVaultMapping: 'horizon'
  }
};
