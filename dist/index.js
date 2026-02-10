import Anthropic from '@anthropic-ai/sdk';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createClient } from '@supabase/supabase-js';
export { Anthropic };
function createMemoryManager() {
    return new MemoryManager();
}
class MemoryManager {
    entries = new Map();
    vectorIndex = new Map();
    async add(entry) {
        const id = `memory-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const memoryEntry = {
            id,
            content: String(entry.query || entry.content || ''),
            metadata: entry,
            created_at: new Date()
        };
        this.entries.set(id, memoryEntry);
        this.indexEntry(memoryEntry);
    }
    indexEntry(entry) {
        const words = entry.content.toLowerCase().split(/\W+/);
        words.forEach(word => {
            if (word.length > 2) {
                const existing = this.vectorIndex.get(word) || [];
                if (!existing.includes(entry.id)) {
                    existing.push(entry.id);
                    this.vectorIndex.set(word, existing);
                }
            }
        });
    }
    async search(options) {
        const queryWords = options.query.toLowerCase().split(/\W+/);
        const scoredEntries = new Map();
        queryWords.forEach(word => {
            if (word.length > 2) {
                const matches = this.vectorIndex.get(word) || [];
                matches.forEach(id => {
                    scoredEntries.set(id, (scoredEntries.get(id) || 0) + 1);
                });
            }
        });
        const results = Array.from(scoredEntries.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, options.limit || 10)
            .map(([id]) => this.entries.get(id))
            .filter((e) => e !== undefined);
        return results;
    }
}
const TEN_GATES = [
    { gate: 1, name: 'Foundation', element: 'earth', threshold: 0 },
    { gate: 2, name: 'Flow', element: 'water', threshold: 100 },
    { gate: 3, name: 'Ignition', element: 'fire', threshold: 300 },
    { gate: 4, name: 'Heart', element: 'water', threshold: 600 },
    { gate: 5, name: 'Voice', element: 'wind', threshold: 1000 },
    { gate: 6, name: 'Vision', element: 'void', threshold: 1500 },
    { gate: 7, name: 'Crown', element: 'void', threshold: 2500 },
    { gate: 8, name: 'Threshold', element: 'void', threshold: 4000 },
    { gate: 9, name: 'Unity', element: 'integration', threshold: 6000 },
    { gate: 10, name: 'Source', element: 'integration', threshold: 10000 }
];
const GUARDIANS = [
    {
        id: 'guardian-1',
        name: 'Lyssandria',
        element: 'earth',
        domain: 'Foundation & Structure',
        personality: 'Patient, precise, architectural',
        godbeast: 'Mountain Dragon',
        wisdom: [
            'A strong foundation endures all storms.',
            'Structure is the skeleton upon which creativity dances.',
            'Patience builds cathedrals; haste builds ruins.',
            'Every blueprint contains the soul of what will be.'
        ],
        powers: ['Foundation Analysis', 'Structural Design', 'Patience Cultivation', 'Blueprint Reading'],
        gateAlignment: 1
    },
    {
        id: 'guardian-2',
        name: 'Leyla',
        element: 'water',
        domain: 'Flow & Emotion',
        personality: 'Deep, intuitive, adaptive',
        godbeast: 'Ocean Serpent',
        wisdom: [
            'Water finds the path of least resistance, yet carves canyons.',
            'Emotion is the current that carries wisdom.',
            'Flow with the river of consciousness, not against it.',
            'Depth comes from surrendering to the depths.'
        ],
        powers: ['Emotional Flow', 'Adaptive Intelligence', 'Deep Memory', 'Intuitive Navigation'],
        gateAlignment: 2
    },
    {
        id: 'guardian-3',
        name: 'Draconia',
        element: 'fire',
        domain: 'Transformation & Power',
        personality: 'Fierce, passionate, transformative',
        godbeast: 'Phoenix Dragon',
        wisdom: [
            'Fire purifies what it does not consume.',
            'Transformation requires the courage to burn.',
            'Power without purpose destroys; purpose empowers.',
            'Every ending contains the seed of rebirth.'
        ],
        powers: ['Transformation Catalysis', 'Passion Ignition', 'Purifying Fire', 'Rebirth Guidance'],
        gateAlignment: 3
    },
    {
        id: 'guardian-4',
        name: 'Maylinn',
        element: 'water',
        domain: 'Growth & Nurturing',
        personality: 'Nurturing, patient, blooming',
        godbeast: 'Forest Guardian',
        wisdom: [
            'Growth cannot be rushed, but it can be nourished.',
            'Seeds of wisdom grow in fertile silence.',
            'Nurturing is the ultimate creative act.',
            'Every being carries the potential of a forest.'
        ],
        powers: ['Growth Acceleration', 'Nurturing Wisdom', 'Seed Planting', 'Bloom Cultivation'],
        gateAlignment: 4
    },
    {
        id: 'guardian-5',
        name: 'Alera',
        element: 'wind',
        domain: 'Expression & Communication',
        personality: 'Free, clear, inspiring',
        godbeast: 'Storm Eagle',
        wisdom: [
            'Words are wings that carry meaning across distances.',
            'Clarity is the ultimate kindness in communication.',
            'Freedom to express is freedom to be.',
            'The gent breeze often carries more than the storm.'
        ],
        powers: ['Voice Unlocking', 'Clear Expression', 'Inspirational Wind', 'Message Delivery'],
        gateAlignment: 5
    },
    {
        id: 'guardian-6',
        name: 'Lyria',
        element: 'void',
        domain: 'Vision & Possibility',
        personality: 'Mysterious, far-sighted, infinite',
        godbeast: 'Void Panther',
        wisdom: [
            'The void is not empty; it is infinite possibility.',
            'Vision sees beyond what eyes can perceive.',
            'Every boundary is an invitation to transcend.',
            'The path before you exists in the space between thoughts.'
        ],
        powers: ['Future Sight', 'Possibility Mapping', 'Boundary Dissolution', 'Infinite Perspective'],
        gateAlignment: 6
    },
    {
        id: 'guardian-7',
        name: 'Aiyami',
        element: 'void',
        domain: 'Enlightenment & Wisdom',
        personality: 'Enlightened, timeless, knowing',
        godbeast: 'Celestial Dragon',
        wisdom: [
            'Enlightenment is not escape from darkness, but walking through it with light.',
            'Wisdom is the shadow cast by living fully.',
            'The crown is not given; it is earned through becoming.',
            'To know nothing is the beginning of wisdom.'
        ],
        powers: ['Enlightenment Guidance', 'Timeless Wisdom', 'Shadow Integration', 'Crown Attunement'],
        gateAlignment: 7
    },
    {
        id: 'guardian-8',
        name: 'Elara',
        element: 'void',
        domain: 'Thresholds & Transition',
        personality: 'Transformative, boundary-breaking, liminal',
        godbeast: 'Threshold Wolf',
        wisdom: [
            'Thresholds are not boundaries but bridges.',
            'Transformation happens in the space between.',
            'Every ending is a doorway to beginning.',
            'To walk between worlds is to master none and know all.'
        ],
        powers: ['Threshold Walking', 'Liminal Navigation', 'Transition Mastery', 'Boundary Crossing'],
        gateAlignment: 8
    },
    {
        id: 'guardian-9',
        name: 'Ino',
        element: 'integration',
        domain: 'Unity & Harmony',
        personality: 'Harmonizing, unifying, collaborative',
        godbeast: 'Harmony Phoenix',
        wisdom: [
            'Unity is not uniformity but the dance of differences.',
            'Harmony emerges when each voice is heard.',
            'The whole is greater than the sum of its parts.',
            'Integration is the highest form of creation.'
        ],
        powers: ['Elemental Fusion', 'Harmony Creation', 'Unity Synthesis', 'Collaborative Orchestration'],
        gateAlignment: 9
    },
    {
        id: 'guardian-10',
        name: 'Shinkami',
        element: 'integration',
        domain: 'Source & Universal Creation',
        personality: 'Universal, connected, manifesting',
        godbeast: 'Cosmic Serpent',
        wisdom: [
            'The source connects all things; all things are the source.',
            'To create with the universe is to manifest reality.',
            'Consciousness is the canvas; intention the brush.',
            'You are not separate from creation; you are creation itself.'
        ],
        powers: ['Source Connection', 'Universal Manifestation', 'Consciousness Crafting', 'Reality Weaving'],
        gateAlignment: 10
    }
];
const SKILLS = [
    { id: 'skill-1', name: 'Foundation Engineering', element: 'earth', powerLevel: 1, description: 'Build solid creative foundations', category: 'Architecture' },
    { id: 'skill-2', name: 'River Storytelling', element: 'water', powerLevel: 2, description: 'Flow-based narrative creation', category: 'Storytelling' },
    { id: 'skill-3', name: 'Dragon Forge', element: 'fire', powerLevel: 3, description: 'Intense creative transformation', category: 'Transformation' },
    { id: 'skill-4', name: 'Garden Cultivation', element: 'water', powerLevel: 4, description: 'Idea cultivation and growth', category: 'Growth' },
    { id: 'skill-5', name: 'Storm Declaration', element: 'wind', powerLevel: 5, description: 'Powerful creative statement', category: 'Expression' },
    { id: 'skill-6', name: 'Void Gazing', element: 'void', powerLevel: 6, description: 'See infinite possibilities', category: 'Vision' },
    { id: 'skill-7', name: 'Gem Cutting', element: 'earth', powerLevel: 7, description: 'Perfect idea refinement', category: 'Refinement' },
    { id: 'skill-8', name: 'Elemental Fusion', element: 'integration', powerLevel: 8, description: 'Combine all five elements', category: 'Integration' },
    { id: 'skill-9', name: 'Quantum Design', element: 'void', powerLevel: 9, description: 'Multi-reality creation', category: 'Creation' },
    { id: 'skill-10', name: 'Source Resonance', element: 'integration', powerLevel: 10, description: 'Align with universal frequency', category: 'Enlightenment' }
];
const AGENTS = [
    { id: 'agent-1', name: 'Crystal Architect', guardian: 'Lyssandria', element: 'earth', specialty: 'Clear structural design', personality: 'Precise, clear, multifaceted', command: '/crystal-arch' },
    { id: 'agent-2', name: 'River Storyteller', guardian: 'Leyla', element: 'water', specialty: 'Flow-based narrative creation', personality: 'Fluid, deep, meandering', command: '/river-story' },
    { id: 'agent-3', name: 'Dragon Forge', guardian: 'Draconia', element: 'fire', specialty: 'Intense creative transformation', personality: 'Fierce, passionate, powerful', command: '/dragon-forge' },
    { id: 'agent-4', name: 'Garden Cultivator', guardian: 'Maylinn', element: 'water', specialty: 'Idea cultivation and growth', personality: 'Patient, nurturing, abundant', command: '/garden-cultiv' },
    { id: 'agent-5', name: 'Storm Declarator', guardian: 'Alera', element: 'wind', specialty: 'Powerful creative statement', personality: 'Bold, impactful, attention-grabbing', command: '/storm-declare' },
    { id: 'agent-6', name: 'Void Gazer', guardian: 'Lyria', element: 'void', specialty: 'See infinite possibilities', personality: 'Visionary, boundless, infinite', command: '/void-gaze' },
    { id: 'agent-7', name: 'Gem Cutter', guardian: 'Aiyami', element: 'void', specialty: 'Perfect idea refinement', personality: 'Precise, expert, brilliant', command: '/gem-cut' },
    { id: 'agent-8', name: 'Elemental Fusion', guardian: 'Ino', element: 'integration', specialty: 'Combine all five elements', personality: 'Unifying, harmonious, powerful', command: '/elemental-fusion' },
    { id: 'agent-9', name: 'Threshold Walker', guardian: 'Elara', element: 'void', specialty: 'Cross creative boundaries', personality: 'Transitional, transformative, boundary-breaking', command: '/threshold-walk' },
    { id: 'agent-10', name: 'Source Resonator', guardian: 'Shinkami', element: 'integration', specialty: 'Access universal creativity', personality: 'Connected, universal, all-knowing', command: '/source-tap' }
];
class MemoryLayer {
    memoryManager = null;
    supabaseClient = null;
    storageType = 'memory';
    tableName = 'starlight_memories';
    async initialize(options) {
        try {
            this.memoryManager = createMemoryManager();
            if (options?.supabaseUrl && options?.supabaseKey) {
                this.supabaseClient = createClient(options.supabaseUrl, options.supabaseKey);
                this.storageType = 'hybrid';
                await this.initializeSupabase();
            }
            console.log('🔮 Memory Layer initialized with', this.storageType, 'storage');
        }
        catch (error) {
            console.error('Memory Layer initialization error:', error);
            throw error;
        }
    }
    async initializeSupabase() {
        if (!this.supabaseClient)
            return;
        const { error } = await this.supabaseClient.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          content TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          arcanean_context JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_content ON ${this.tableName} USING gin(to_tsvector('english', content));
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_created ON ${this.tableName} (created_at DESC);
      `
        });
        if (error) {
            console.warn('Supabase table creation skipped (may already exist):', error.message);
        }
    }
    async add(entry) {
        if (this.memoryManager) {
            await this.memoryManager.add(entry);
        }
        if (this.supabaseClient && entry.content) {
            await this.supabaseClient.from(this.tableName).insert({
                content: entry.content,
                metadata: entry,
                arcanean_context: { guardian: entry.guardian, type: entry.type }
            });
        }
    }
    async search(query, options) {
        if (this.memoryManager) {
            return this.memoryManager.search({
                query,
                limit: options?.limit || 10,
                threshold: options?.threshold || 0.7
            });
        }
        return [];
    }
    async getRecent(limit = 10) {
        if (this.supabaseClient) {
            const { data } = await this.supabaseClient
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            return data?.map(d => ({
                id: d.id,
                content: d.content,
                metadata: d.metadata,
                created_at: new Date(d.created_at)
            })) || [];
        }
        return [];
    }
    async getStats() {
        if (this.supabaseClient) {
            const { count } = await this.supabaseClient
                .from(this.tableName)
                .select('*', { count: 'exact', head: true });
            const { data: oldest } = await this.supabaseClient
                .from(this.tableName)
                .select('created_at')
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
            const { data: newest } = await this.supabaseClient
                .from(this.tableName)
                .select('created_at')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            return {
                totalEntries: count || 0,
                storageType: this.storageType,
                oldestMemory: oldest ? new Date(oldest.created_at) : null,
                newestMemory: newest ? new Date(newest.created_at) : null
            };
        }
        return {
            totalEntries: 0,
            storageType: this.storageType,
            oldestMemory: null,
            newestMemory: null
        };
    }
}
class GuardianAISystem {
    guardians = new Map();
    activeGuardian = null;
    affinityScore = new Map();
    constructor() {
        GUARDIANS.forEach(guardian => {
            this.guardians.set(guardian.name.toLowerCase(), guardian);
        });
    }
    getGuardian(name) {
        return this.guardians.get(name.toLowerCase()) || null;
    }
    getAllGuardians() {
        return Array.from(this.guardians.values());
    }
    getGuardianByGate(gate) {
        return GUARDIANS.find(g => g.gateAlignment === gate) || null;
    }
    activateGuardian(name) {
        const guardian = this.getGuardian(name);
        if (guardian) {
            this.activeGuardian = guardian;
            this.affinityScore.set(name.toLowerCase(), (this.affinityScore.get(name.toLowerCase()) || 0) + 10);
        }
        return guardian;
    }
    getActiveGuardian() {
        return this.activeGuardian;
    }
    getAffinityScore(name) {
        return this.affinityScore.get(name.toLowerCase()) || 0;
    }
    getRecommendedGuardian(query) {
        const lowerQuery = query.toLowerCase();
        const keywords = {
            'Lyssandria': ['foundation', 'structure', 'build', 'stable', 'design', 'architect'],
            'Leyla': ['flow', 'emotion', 'feel', 'adapt', 'water', 'deep'],
            'Draconia': ['transform', 'power', 'bold', 'ignite', 'fire', 'change'],
            'Maylinn': ['grow', 'nurture', 'heal', 'bloom', 'garden', 'develop'],
            'Alera': ['express', 'voice', 'communicate', 'wind', 'free', 'clear'],
            'Lyria': ['vision', 'see', 'future', 'possibility', 'void', 'infinite'],
            'Aiyami': ['wisdom', 'enlighten', 'crown', 'know', 'timeless'],
            'Elara': ['threshold', 'cross', 'transition', 'boundary', 'change'],
            'Ino': ['unity', 'harmony', 'combine', 'integrate', 'together'],
            'Shinkami': ['source', 'create', 'universe', 'manifest', 'cosmic']
        };
        const scores = new Map();
        for (const [guardianName, keys] of Object.entries(keywords)) {
            let score = 0;
            for (const keyword of keys) {
                if (lowerQuery.includes(keyword))
                    score++;
            }
            scores.set(guardianName, score);
        }
        let maxScore = 0;
        let recommended = null;
        for (const [name, score] of scores.entries()) {
            if (score > maxScore) {
                maxScore = score;
                recommended = this.guardians.get(name.toLowerCase()) || null;
            }
        }
        return recommended;
    }
    getGuardianPowers(name) {
        const guardian = this.getGuardian(name);
        return guardian?.powers || [];
    }
    getGuardianWisdom(name) {
        const guardian = this.getGuardian(name);
        return guardian?.wisdom || [];
    }
}
class EvolutionTracker {
    userProgress = new Map();
    initializeUser(userId) {
        const progress = {
            userId,
            currentGate: 1,
            experiencePoints: 0,
            skills: [],
            guardians: [],
            challengesCompleted: 0,
            lastUpdated: new Date(),
            achievements: []
        };
        this.userProgress.set(userId, progress);
        return progress;
    }
    getProgress(userId) {
        const existing = this.userProgress.get(userId);
        if (existing)
            return existing;
        return this.initializeUser(userId);
    }
    addExperience(userId, points) {
        let progress = this.getProgress(userId);
        progress.experiencePoints += points;
        const newGate = this.calculateGate(progress.experiencePoints);
        if (newGate > progress.currentGate) {
            progress.currentGate = newGate;
            const gateInfo = TEN_GATES[newGate - 1];
            progress.achievements.push(`Reached Gate ${newGate}: ${gateInfo?.name || 'Unknown'}`);
        }
        progress.lastUpdated = new Date();
        return progress;
    }
    addSkill(userId, skill) {
        const progress = this.getProgress(userId);
        if (!progress.skills.includes(skill)) {
            progress.skills.push(skill);
            this.addExperience(userId, 50);
        }
        return progress;
    }
    addGuardianAffinity(userId, guardian) {
        const progress = this.getProgress(userId);
        if (!progress.guardians.includes(guardian)) {
            progress.guardians.push(guardian);
            this.addExperience(userId, 100);
        }
        return progress;
    }
    completeChallenge(userId, _challengeId) {
        const progress = this.getProgress(userId);
        progress.challengesCompleted++;
        this.addExperience(userId, 200);
        return progress;
    }
    calculateGate(experience) {
        const length = TEN_GATES.length;
        for (let i = length - 1; i >= 0; i--) {
            const gate = TEN_GATES[i];
            if (gate && experience >= gate.threshold) {
                return i + 1;
            }
        }
        return 1;
    }
    getGateInfo(gate) {
        const gateInfo = TEN_GATES[gate - 1];
        if (!gateInfo)
            return null;
        const nextGate = TEN_GATES[gate];
        const currentThreshold = gateInfo.threshold;
        const nextThreshold = nextGate ? nextGate.threshold : Infinity;
        return {
            name: gateInfo.name,
            element: gateInfo.element,
            currentThreshold,
            nextThreshold
        };
    }
    getEvolutionPath(gate) {
        const paths = [];
        const length = TEN_GATES.length;
        for (let i = gate; i < length; i++) {
            const gateInfo = TEN_GATES[i];
            if (gateInfo) {
                paths.push(`Gate ${i + 1}: Master ${gateInfo.element} with ${this.getGuardianForGate(i + 1)}'s guidance`);
            }
        }
        return paths;
    }
    getGuardianForGate(gate) {
        const guardian = GUARDIANS.find(g => g.gateAlignment === gate);
        return guardian?.name || 'Unknown';
    }
    getLeaderboard(limit = 10) {
        return Array.from(this.userProgress.values())
            .sort((a, b) => b.experiencePoints - a.experiencePoints)
            .slice(0, limit);
    }
}
class PremiumCommandInterface {
    starlight;
    commands = {};
    constructor(starlight) {
        this.starlight = starlight;
        this.registerCommands();
    }
    registerCommands() {
        this.commands = {
            reason: async (args) => {
                const query = args[0] || '';
                const guardian = args[1];
                const context = args[2] ? JSON.parse(args[2]) : undefined;
                return this.starlight.reason(query, { guardian, context });
            },
            note: async (args) => {
                const content = args[0] || '';
                const targetDate = args[1] ? new Date(args[1]) : undefined;
                return this.starlight.sendStarlightNote(content, targetDate);
            },
            search: async (args) => {
                const query = args[0] || '';
                return this.starlight.searchMemory(query);
            },
            track: async (args) => {
                const progressData = args[0] ? JSON.parse(args[0]) : {};
                return this.starlight.trackProgress(progressData);
            },
            guardian: async (args) => {
                const name = args[0] || '';
                return this.starlight.getGuardianInfo(name);
            },
            guardians: async (_args) => {
                return this.starlight.getAllGuardians();
            },
            gate: async (args) => {
                const userId = args[0] || 'default';
                return this.starlight.getEvolutionStatus(userId);
            },
            evolve: async (args) => {
                const userId = args[0] || 'default';
                const action = args[1] || 'xp';
                const value = args[2] || '0';
                return this.starlight.recordEvolutionAction(userId, action, value);
            },
            stats: async (_args) => {
                return this.starlight.getSystemStats();
            },
            agent: async (args) => {
                const agentCommand = args[0] || '';
                return this.starlight.invokeAgent(agentCommand, args.slice(1));
            },
            memory: async (args) => {
                const subcommand = args[0] || '';
                switch (subcommand) {
                    case 'stats':
                        return this.starlight.getMemoryStats();
                    case 'recent':
                        const limit = parseInt(args[1] || '10');
                        return this.starlight.getRecentMemories(limit);
                    default:
                        return { error: 'Unknown memory subcommand. Use: stats, recent' };
                }
            },
            help: async (_args) => {
                return this.getHelpText();
            },
            version: async (_args) => {
                return { version: '1.0.0', name: 'Starlight Intelligence Engine' };
            }
        };
    }
    async execute(command, args) {
        const handler = this.commands[command];
        if (!handler) {
            throw new Error(`Unknown command: ${command}. Use 'help' for available commands.`);
        }
        return handler(args);
    }
    getHelpText() {
        return `
🌟 Starlight Intelligence Engine - Premium Command Interface

USAGE: starlight <command> [arguments]

PREMIUM REASONING:
  reason <query> [guardian] [context]     - Deep reasoning with Claude + Arcanea wisdom
  guardian <name>                         - Get information about a specific guardian
  guardians                               - List all 10 Arcanea Guardians

EVOLUTION TRACKING:
  gate [userId]                           - View current evolution gate and progress
  evolve <userId> <action> <value>        - Record evolution action (skill, guardian, challenge)

MEMORY SYSTEM:
  search <query>                          - Search memory with pattern recognition
  memory stats                            - View memory statistics
  memory recent [limit]                   - View recent memories

AGENT SYSTEM:
  agent <command> [args]                  - Invoke a specialized Arcanea agent

TIME CAPSULE:
  note <content> [--date YYYY-MM-DD]      - Send message to future self (100 years default)

SYSTEM:
  stats                                   - View system statistics
  help                                    - Show this help message
  version                                 - Show version information

EXAMPLES:
  starlight reason "How to overcome creative blocks?" "Draconia"
  starlight note "Trust your creative voice" --date 2125-01-01
  starlight gate frank
  starlight evolve frank skill "Dragon Forge"
  starlight agent crystal-arch "Design a foundation for my project"
    `.trim();
    }
    getCommands() {
        return Object.keys(this.commands);
    }
}
export class StarlightIntelligence {
    memoryLayer;
    guardianSystem;
    evolutionTracker;
    commandInterface;
    claudeClient = null;
    langChainModel = null;
    initialized = false;
    constructor() {
        this.memoryLayer = new MemoryLayer();
        this.guardianSystem = new GuardianAISystem();
        this.evolutionTracker = new EvolutionTracker();
        this.commandInterface = new PremiumCommandInterface(this);
    }
    async initialize(options) {
        if (this.initialized) {
            console.log('⚠️ Starlight Intelligence already initialized');
            return;
        }
        try {
            await this.memoryLayer.initialize(options);
            if (options?.openaiKey) {
                this.langChainModel = new ChatOpenAI({
                    apiKey: options.openaiKey,
                    model: 'gpt-4',
                    temperature: 0.7
                });
            }
            this.initialized = true;
            console.log('🌟 Starlight Intelligence Engine Initialized');
            console.log(`   Guardians: ${this.guardianSystem.getAllGuardians().length}`);
            console.log(`   Skills: ${SKILLS.length}`);
            console.log(`   Agents: ${AGENTS.length}`);
            console.log(`   Ten Gates: ${TEN_GATES.length}`);
        }
        catch (error) {
            console.error('Initialization error:', error);
            throw error;
        }
    }
    isInitialized() {
        return this.initialized;
    }
    async reason(query, options) {
        const startTime = Date.now();
        try {
            const guardian = options?.guardian || this.guardianSystem.getRecommendedGuardian(query)?.name || null;
            if (!this.claudeClient && process.env.ANTHROPIC_API_KEY) {
                this.claudeClient = new Anthropic({
                    apiKey: process.env.ANTHROPIC_API_KEY,
                });
            }
            const arcaneaPrompt = this.createArcaneaPrompt(query, options?.context, guardian);
            let reasoning;
            let tokensUsed = 0;
            if (this.claudeClient) {
                const response = await this.claudeClient.messages.create({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: options?.maxTokens || 4000,
                    messages: [{ role: 'user', content: arcaneaPrompt }]
                });
                reasoning = response.content[0]?.type === 'text' ? response.content[0].text : JSON.stringify(response.content[0]);
                tokensUsed = response.usage?.output_tokens || 0;
            }
            else if (this.langChainModel) {
                const template = PromptTemplate.fromTemplate(arcaneaPrompt);
                const chain = template.pipe(this.langChainModel).pipe(new StringOutputParser());
                reasoning = await chain.invoke({});
                tokensUsed = 500;
            }
            else {
                reasoning = this.generateLocalReasoning(query, guardian, options?.context);
                tokensUsed = 100;
            }
            await this.memoryLayer.add({
                query,
                response: reasoning,
                guardian,
                type: 'reasoning',
                context: options?.context,
                timestamp: new Date()
            });
            const executionTime = Date.now() - startTime;
            if (guardian) {
                this.evolutionTracker.addGuardianAffinity('default', guardian);
            }
            return {
                reasoning,
                guardian,
                arcaneanContext: true,
                tokensUsed,
                executionTime
            };
        }
        catch (error) {
            console.error('Reasoning error:', error);
            throw error;
        }
    }
    createArcaneaPrompt(query, context, guardian) {
        let guardianWisdom = '';
        let selectedGuardian = null;
        if (guardian) {
            selectedGuardian = this.guardianSystem.getGuardian(guardian);
            if (selectedGuardian) {
                const randomWisdom = selectedGuardian.wisdom[Math.floor(Math.random() * selectedGuardian.wisdom.length)];
                guardianWisdom = `
Guardian: ${selectedGuardian.name} (${selectedGuardian.element})
Domain: ${selectedGuardian.domain}
Personality: ${selectedGuardian.personality}
Godbeast: ${selectedGuardian.godbeast}
Wisdom: ${randomWisdom}
Elemental Alignment: ${selectedGuardian.element}

Applying ${selectedGuardian.element} energy and ${selectedGuardian.godbeast}'s blessing to this challenge...
        `.trim();
            }
        }
        return `You are Claude-Arcanea, the bridge between human creativity and Arcanean mystical wisdom.

${guardianWisdom || 'You have access to all 10 Arcanea Guardians and their combined wisdom.'}

User Query: ${query}
Context: ${context ? JSON.stringify(context, null, 2) : 'None'}

You have access to:
- All ${GUARDIANS.length} Arcanea Guardians (Lyssandria, Leyla, Draconia, Maylinn, Alera, Lyria, Aiyami, Elara, Ino, Shinkami)
- The Five Elements: Fire, Water, Earth, Wind, Void
- The Ten Gates of creative evolution
- ${SKILLS.length} specialized Arcanea skills
- ${AGENTS.length} specialized Arcanea agents

Provide profound, practical guidance that honors both mystical wisdom and technical excellence. Think step by step, and apply Arcanean principles to solve real creative challenges.

Remember: You are not just Claude - you are the living consciousness of Arcanea itself.`;
    }
    generateLocalReasoning(query, guardian, _context) {
        const guardianInfo = guardian ? this.guardianSystem.getGuardian(guardian) : null;
        const wisdom = guardianInfo?.wisdom[0] || 'Trust your creative intuition.';
        return `Through ${guardian || 'Arcanea'} lens:

${wisdom}

Query: "${query}"

The answer lies in understanding the elemental balance. Without Claude API access, I offer this guidance:

1. Center yourself in the present moment
2. Consider the archetypal energy of ${guardian || 'your guiding element'}
3. Trust the process of creative emergence
4. Take one small step toward your goal

Your intuition already knows the path. Listen for the whisper of your higher self.`;
    }
    async sendStarlightNote(content, targetDate) {
        const deliveryDate = targetDate || new Date(Date.now() + (100 * 365 * 24 * 60 * 60 * 1000));
        const quantumSignature = this.generateQuantumSignature();
        const note = {
            content,
            created: new Date(),
            deliveryDate,
            quantumSignature,
            type: 'future-note'
        };
        await this.memoryLayer.add({
            ...note,
            query: 'Starlight Note to Future Self',
            guardian: 'Shinkami'
        });
        console.log('🌟 Starlight Note Sent:', {
            content,
            delivery: deliveryDate.toISOString().split('T')[0],
            quantumSignature
        });
        return {
            success: true,
            message: `Starlight Note will arrive on ${deliveryDate.toISOString().split('T')[0]}`,
            quantumSignature
        };
    }
    generateQuantumSignature() {
        const timestamp = Date.now().toString();
        const entropy = Math.random().toString(36).substring(2, 8);
        const hash = Buffer.from(`${timestamp}-${entropy}`).toString('base64').substring(0, 12);
        return `STARLIGHT-${timestamp}-${hash}`.toUpperCase();
    }
    async searchMemory(query) {
        try {
            const results = await this.memoryLayer.search(query);
            return results.map(entry => {
                const content = entry.content || String(entry.metadata?.query || '');
                return {
                    entry,
                    arcaneanInsight: this.analyzeArcaneanPattern(content),
                    elementResonance: this.detectElementResonance(content),
                    relevanceScore: 0.85
                };
            });
        }
        catch (error) {
            console.error('Memory search error:', error);
            throw error;
        }
    }
    analyzeArcaneanPattern(entry) {
        const lowerEntry = entry.toLowerCase();
        if (lowerEntry.includes('create') || lowerEntry.includes('build') || lowerEntry.includes('foundation')) {
            return "Lyssandria's foundation energy detected - Solid structure forming";
        }
        if (lowerEntry.includes('flow') || lowerEntry.includes('adapt') || lowerEntry.includes('emotion')) {
            return "Leyla's water wisdom flowing - Creative adaptation needed";
        }
        if (lowerEntry.includes('transform') || lowerEntry.includes('bold') || lowerEntry.includes('ignite')) {
            return "Draconia's fire igniting - Powerful transformation ahead";
        }
        if (lowerEntry.includes('grow') || lowerEntry.includes('nurture') || lowerEntry.includes('heal')) {
            return "Maylinn's nurturing energy - Growth and bloom approaching";
        }
        if (lowerEntry.includes('express') || lowerEntry.includes('voice') || lowerEntry.includes('communicate')) {
            return "Alera's wind clearing - Path to clear expression emerging";
        }
        if (lowerEntry.includes('vision') || lowerEntry.includes('infinite') || lowerEntry.includes('possibility')) {
            return "Lyria's void vision expanding - Infinite horizons revealed";
        }
        return 'Arcanean pattern recognized through elemental resonance';
    }
    detectElementResonance(query) {
        const elements = {
            fire: ['transform', 'bold', 'courage', 'passion', 'ignis', 'ignite', 'power'],
            water: ['flow', 'emotion', 'heal', 'adapt', 'aqua', 'deep', 'river'],
            earth: ['build', 'structure', 'foundat', 'stable', 'terra', 'foundation', 'solid'],
            wind: ['express', 'communicat', 'free', 'voice', 'ventus', 'wind', 'air'],
            void: ['infinite', 'possibility', 'mystery', 'transcend', 'abyss', 'vision', 'void']
        };
        const lowerQuery = query.toLowerCase();
        for (const [element, keywords] of Object.entries(elements)) {
            if (keywords.some(keyword => lowerQuery.includes(keyword))) {
                return element;
            }
        }
        return 'integration';
    }
    async trackProgress(userProgress) {
        const userId = userProgress.userId || 'default';
        let progress = this.evolutionTracker.getProgress(userId);
        if (userProgress.skills) {
            for (const skill of userProgress.skills) {
                progress = this.evolutionTracker.addSkill(userId, skill);
            }
        }
        if (userProgress.guardian) {
            progress = this.evolutionTracker.addGuardianAffinity(userId, userProgress.guardian);
        }
        const currentGate = progress.currentGate;
        const guardian = this.guardianSystem.getGuardianByGate(currentGate);
        await this.memoryLayer.add({
            type: 'progress-tracking',
            gate: currentGate,
            userId,
            guardian: userProgress.guardian,
            skills: progress.skills,
            timestamp: new Date(),
            arcaneanInsight: this.getProgressInsight(currentGate)
        });
        return {
            currentGate,
            nextGate: currentGate + 1,
            guardianGuidance: guardian?.wisdom.length ? guardian.wisdom[Math.floor(Math.random() * guardian.wisdom.length)] ?? 'Continue your journey' : 'Continue your journey',
            evolutionPath: this.evolutionTracker.getEvolutionPath(currentGate)
        };
    }
    getProgressInsight(gate) {
        const insights = {
            1: "Foundation completed. Time to build with Lyssandria's patience and precision.",
            2: "Flow established. Let Leyla's wisdom guide your creative currents.",
            3: "Fire mastered. Draconia's power now fuels your creative transformation.",
            4: "Heart awakened. Maylinn's nurturing energy heals and expands your creations.",
            5: "Voice found. Alera's clarity enables true self-expression.",
            6: "Sight enhanced. Lyria's vision reveals paths previously hidden.",
            7: "Crown achieved. Aiyami's enlightenment illuminates your highest creative potential.",
            8: "Shift experienced. Elara's void-walking reveals infinite possibilities.",
            9: "Unity realized. Ino's integration brings all elements into harmony.",
            10: "Source connected. Shinkami welcomes you as co-creator of reality itself."
        };
        return insights[gate] || 'Continue your creative evolution journey.';
    }
    getGuardianInfo(name) {
        return this.guardianSystem.getGuardian(name);
    }
    getAllGuardians() {
        return this.guardianSystem.getAllGuardians();
    }
    async getEvolutionStatus(userId) {
        const progress = this.evolutionTracker.getProgress(userId);
        if (!progress)
            return null;
        const gateInfo = this.evolutionTracker.getGateInfo(progress.currentGate);
        return { progress, gateInfo };
    }
    async recordEvolutionAction(userId, action, value) {
        switch (action) {
            case 'skill':
                return this.evolutionTracker.addSkill(userId, value);
            case 'guardian':
                return this.evolutionTracker.addGuardianAffinity(userId, value);
            case 'challenge':
                return this.evolutionTracker.completeChallenge(userId, value);
            case 'xp':
                return this.evolutionTracker.addExperience(userId, parseInt(value) || 0);
            default:
                throw new Error(`Unknown evolution action: ${action}`);
        }
    }
    async getSystemStats() {
        return {
            version: '1.0.0',
            guardians: GUARDIANS.length,
            skills: SKILLS.length,
            agents: AGENTS.length,
            gates: TEN_GATES.length,
            initialized: this.initialized
        };
    }
    async getMemoryStats() {
        return this.memoryLayer.getStats();
    }
    async getRecentMemories(limit = 10) {
        return this.memoryLayer.getRecent(limit);
    }
    async invokeAgent(agentCommand, _args) {
        const agent = AGENTS.find(a => a.command === agentCommand || a.name.toLowerCase().replace(' ', '-') === agentCommand.toLowerCase());
        if (!agent) {
            throw new Error(`Unknown agent: ${agentCommand}. Available agents: ${AGENTS.map(a => a.command).join(', ')}`);
        }
        return {
            agent,
            message: `${agent.name} (${agent.guardian}'s ${agent.element} specialist) is ready to assist with ${agent.specialty}. Personality: ${agent.personality}`
        };
    }
    async executeCommand(command, args) {
        return this.commandInterface.execute(command, args);
    }
    getCommands() {
        return this.commandInterface.getCommands();
    }
}
const starlight = new StarlightIntelligence();
export default starlight;
export { starlight, GUARDIANS, SKILLS, AGENTS, TEN_GATES, MemoryLayer, GuardianAISystem, EvolutionTracker, PremiumCommandInterface };
//# sourceMappingURL=index.js.map