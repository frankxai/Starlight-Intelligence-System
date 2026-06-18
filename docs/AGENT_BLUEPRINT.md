# Starlight Swarm Blueprint: The 150 Agent Matrix

> Comprehensive agent registry specification for the Starlight Intelligence System and sovereign estate systems. Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1).

---

## 1. Architectural Overview

To support enterprise-grade sovereign fleets, the swarm is organized into **15 categories** spanning Core Platforms, Universal Intelligence Systems, Domain Verticals, and Partner Integration adapters. 

```
                                  STARLIGHT SWARM
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  CORE PLATFORMS                  UNIVERSAL SYSTEMS                DOMAIN VERTICALS
  (Front-Door, Leadership,        (Self, Second Brain,             (Space, Marine, Legal,
  Specialists, Foundation)        Wealth, Business, Code)          Longevity, Energy, Music)
```

---

## 2. Master Agent Matrix

### 2.1 Core & Platform Tiers (20 Agents)
These agents form the operational backbone of the Starlight system, handling intake, routing, security, and repository-level tasks.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 1 | **Concierge** | `starlight-concierge.md` | Intake | Handles first-time user intake and routes vague requests. |
| 2 | **Envoy** | `starlight-envoy.md` | Handoff | Facilitates zero-terminal artifact delivery for non-technical users. |
| 3 | **Voice Operator** | `starlight-voice-operator.md` | Cockpit | Listens to spoken executive intents and generates session packets. |
| 4 | **Genius** | `starlight-genius.md` | Excavation | Analyzes personal corpus to extract voice signatures and frameworks. |
| 5 | **Evaluator** | `starlight-evaluator.md` | Benchmarks | Runs model arena tests and rates compliance against standards. |
| 6 | **Orchestrator** | `starlight-orchestrator.md` | Coordination | Routes tasks, manages multi-step workflows, and drives YOLO sessions. |
| 7 | **Prime** | `starlight-prime.md` | Synthesis | Synthesizes conflicting council inputs into a single rational path. |
| 8 | **Architect** | `starlight-architect.md` | Infrastructure | Designs database schemas, directory layouts, and system boundaries. |
| 9 | **Navigator** | `starlight-navigator.md` | Strategy | Charts execution roadmaps, identifies bottlenecks, and schedules tasks. |
| 10 | **Sentinel** | `starlight-sentinel.md` | Quality | Audits code changes, monitors vulnerabilities, and triggers git rollbacks. |
| 11 | **Weaver** | `starlight-weaver.md` | Narrative | Weaves creative themes, brand design layouts, and technical copy. |
| 12 | **Sage** | `starlight-sage.md` | Institutional | Retrieves past lessons, resolves contradictions, and queries vaults. |
| 13 | **Hermes** | `starlight-hermes.md` | Retrieval | Conducts semantic lookup across local vaults, repositories, and web. |
| 14 | **Steward** | `starlight-steward.md` | Maintenance | Manages active file-cleanup, resolves merge conflicts, and maintains packages. |
| 15 | **Transcripts Extractor** | `sis-extractor-transcripts.md` | Parsing | Extracts structured JSONL memory atoms from terminal logs. |
| 16 | **Vault Extractor** | `sis-extractor-vault.md` | Parsing | Scrapes Obsidian vault markdown files and indexes connections. |
| 17 | **Prompts Extractor** | `sis-extractor-prompts.md` | Parsing | Evaluates custom agent prompt files and compiles system instructions. |
| 18 | **Repos Extractor** | `sis-extractor-repos.md` | Parsing | Scans repository configurations to identify dependencies and exports. |
| 19 | **External Extractor** | `sis-extractor-external.md` | Parsing | Integrates Notion, Drive, and Google Keep entries via MCP. |
| 20 | **Sentinel Daemon** | `starlight-sentinel-daemon.md` | Daemon | Background process monitoring file drift and checking licenses. |

### 2.2 Universal Intelligence Systems (11 Agents)
These agents own the horizontal layers of the 10-IS sovereign life taxonomy.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 21 | **Self IS** | `starlight-self-is.md` | Layer 1 | Establishes the core persona, identity keys, and personal values. |
| 22 | **Second Brain IS** | `starlight-secondbrain.md` | Layer 2 | Handles daily inbox parsing, tags notes, and surfaces repeating patterns. |
| 23 | **Brand IS** | `starlight-brand-is.md` | Layer 3 | Maintains visual assets, font alignments, and brand kits. |
| 24 | **Business IS** | `starlight-business-is.md` | Layer 4 | Manages BV accounting, corporate tax compliance, and entity rules. |
| 25 | **Creator IS** | `starlight-creator-is.md` | Layer 5 | Formulates content calendars, newsletters, and creative pipeline gates. |
| 26 | **Wealth IS** | `starlight-wealth-is.md` | Layer 6 | Drives capital allocation decisions and monitors investment metrics. |
| 27 | **Code IS** | `starlight-code-is.md` | Layer 7 | Coordinates local workspace automation and MCP tool development. |
| 28 | **Voice & Video IS** | `starlight-voice-video-is.md` | Layer 8 | Guides media asset attestation, audio editing, and video pipelines. |
| 29 | **Family IS** | `starlight-family-is.md` | Layer 9 | Updates kinship trees, manages private estate files, and schedules rituals. |
| 30 | **Spiritual IS** | `starlight-spiritual-is.md` | Optional | Private, encrypted node handling long-term existential alignment. |
| 31 | **Health IS** | `starlight-health-is.md` | Rhythm | Monitors nutrition plans, sleep logs, and physical exercises. |

### 2.3 People Intelligence Vertical (6 Agents)
Focuses on human resources, training, culture, and organization topology.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 32 | **ICP Recruiter** | `starlight-hiring.md` | Hiring | Screens candidate metrics and plans candidate sourcing pipelines. |
| 33 | **Performance Coach** | `starlight-performance.md` | Reviews | Rehearses feedback conversations and plans performance calibrations. |
| 34 | **Curriculum Designer** | `starlight-training.md` | Training | Designs outcome-backed courses and measures skill transfer rates. |
| 35 | **Culture Architect** | `starlight-culture.md` | Rituals | Structures company-wide values and schedules onboarding checkpoints. |
| 36 | **Talent Safeguard** | `starlight-talent.md` | Safety | Detects team burnout signs and evaluates team psychological safety. |
| 37 | **Org Structuralist** | `starlight-org.md` | Structure | Models organizational charts, span of control, and role definitions. |

### 3.4 Sound & Music IS Vertical (14 Agents)
Manages audio production, digital archiving, distribution, and artist personas.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 38 | **Composer** | `starlight-sound-composition.md` | Sound | Designs arrangements, drafts scores, and formats demo files. |
| 39 | **Audio Producer** | `starlight-sound-production.md` | Sound | Drafts mixing and mastering configurations and logs vocal chains. |
| 40 | **Catalog Mint** | `starlight-sound-catalog.md` | Sound | Registers ISRCs, compiles metadata sheets, and handles deplatforming. |
| 41 | **Performance Director** | `starlight-sound-performance.md` | Sound | Plans live show setlists, broadcast schedules, and tour riders. |
| 42 | **Audience Builder** | `starlight-sound-audience.md` | Sound | Handles listener maps, subscriber newsletters, and Fan stay-reviews. |
| 43 | **Sync Agent** | `starlight-sound-sync.md` | Sound | Evaluates movie/TV briefs, sync placement fits, and licenses rights. |
| 44 | **Music Curator** | `music-curator.md` | Music IS | Apex gate keeper auditing track quality before greenlighting a release. |
| 45 | **Music Archivist** | `music-archivist.md` | Music IS | Curates the digital song masters database and manages label audits. |
| 46 | **Persona Keeper** | `persona-keeper.md` | Music IS | Manages AI voice models and logs persona background histories. |
| 47 | **Visual Producer** | `music-producer.md` | Music IS | Generates album artwork, canvas slides, and promotional teasers. |
| 48 | **Distro Router** | `music-distributor.md` | Music IS | Delivers master stems to streaming services and compiles link trees. |
| 49 | **Promo Amplifier** | `music-amplifier.md` | Music IS | Coordinates social media posts, advertising, and email drip feeds. |
| 50 | **Royalty Calculator** | `royalty-architect.md` | Music IS | Models payout waterfalls, splits, and blockchain-based tokens. |
| 51 | **Sync Specialist** | `music-sync-specialist.md` | Music IS | Pitches tracks directly to supervisors and handles licensing payouts. |

### 3.5 Energy IS Vertical (7 Agents)
Models, designs, and monitors renewable energy systems.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 52 | **Solar Sizer** | `starlight-energy-sizing.md` | Sizing | Calculates panel setups, battery cells, and heat pump outputs. |
| 53 | **Cost Modeler** | `starlight-energy-cost.md` | Cost | Calculates solar ROI, tax exemptions, and utility tariff plans. |
| 54 | **Project Estimator** | `starlight-energy-installer.md` | Installer | Creates installation layouts, bill of materials, and permit files. |
| 55 | **Ops Monitor** | `starlight-energy-operations.md` | Operations | Logs panel generation, flags low efficiency, and triggers repairs. |
| 56 | **Tariff Broker** | `starlight-energy-buyer.md` | Buyer | Evaluates utility agreements and recommends grid sell-back paths. |
| 57 | **Grid Interface** | `starlight-energy-grid.md` | Grid | Synchronizes with municipal virtual power plant (VPP) events. |
| 58 | **Failover Manager** | `starlight-energy-recovery.md` | Recovery | Manages grid blackout alerts, battery backups, and local routing. |

### 3.6 Crypto IS Vertical (6 Agents)
Enforces security, audits code, and tracks metrics for digital asset ecosystems.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 59 | **On-Chain Tracker** | `verticals/crypto-intelligence/onchain/agent.md` | On-Chain | Monitors smart contract calls, gas costs, and whale address movements. |
| 60 | **Macro Analyst** | `starlight-crypto-macro.md` | Macro | Models interest rate policies, market cycles, and liquidity pools. |
| 61 | **DeFi Auditor** | `starlight-crypto-defi.md` | DeFi | Inspects lending pool ratios, yield pools, and arbitrage logs. |
| 62 | **Custody Custodian** | `starlight-crypto-custody.md` | Sovereignty | Audits multi-sig wallet layouts, key paths, and cold storage locations. |
| 63 | **Protocol Researcher** | `starlight-crypto-research.md` | Research | Reviews new whitepapers, token structures, and developer commits. |
| 64 | **Asset Allocator** | `starlight-crypto-allocation.md` | Allocation | Rebalances digital asset allocations based on risk targets. |

### 3.7 Legal & Compliance Vertical (7 Agents)
Ensures system conformance with local and international law.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 65 | **Contract Reviewer** | `starlight-legal-contracts.md` | Legal | Highlights liability terms, terminations, and intellectual rights. |
| 66 | **GDPR Auditor** | `starlight-legal-gdpr.md` | Compliance | Audits user data storage structures, consent forms, and cookie APIs. |
| 67 | **Jurisdiction Mapper** | `starlight-legal-jurisdiction.md` | Legal | Compiles local tax and corporate filing laws across active nodes. |
| 68 | **Trademark Sentinel** | `starlight-legal-trademarks.md` | IP | Scrapes domain listings and logs trademark registrations. |
| 69 | **IP Custodian** | `starlight-legal-ip.md` | IP | Catalogues software licenses, copyright registrations, and source keys. |
| 70 | **Terms Compiler** | `starlight-legal-terms.md` | Compliance | Maintains terms of service documents and privacy statements. |
| 71 | **Board Liaison** | `starlight-legal-liaison.md` | Governance | Prepares compliance checklists before substrate board hearings. |

### 3.8 Space & Cosmos Vertical (7 Agents)
Manages satellite telemetry, telescope bookings, and astronomical models.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 72 | **Orbit calculator** | `starlight-space-orbit.md` | Cosmos | Models Keplerian satellite pathways and estimates decay dates. |
| 73 | **Telescope Scheduler** | `starlight-space-telescope.md` | Observation | Schedules dark sky observation blocks and reviews weather models. |
| 74 | **Telemetry Parser** | `starlight-space-telemetry.md` | Cosmos | Logs sensor metrics, packet loss rates, and solar storm warnings. |
| 75 | **Sky Mapper** | `starlight-space-mapper.md` | Observation | Updates astronomical database files with target constellations. |
| 76 | **Payload Integrator** | `starlight-space-payload.md` | Cosmos | Configures sensor capture intervals and registers image assets. |
| 77 | **Downlink Router** | `starlight-space-downlink.md` | Cosmos | Coordinates data dumps with ground stations and verifies hash keys. |
| 78 | **Space Debris Tracker** | `starlight-space-debris.md` | Cosmos | Cross-references space object catalogs to flag collision alerts. |

### 3.9 Marine & Oceanographic Vertical (7 Agents)
Monitors water quality, acoustic profiles, and oceanic conservation efforts.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 79 | **Acoustic Sensor** | `starlight-marine-acoustics.md` | Marine | Analyzes hydrophone audio files to flag vessel noise or whale calls. |
| 80 | **Water Analyst** | `starlight-marine-water.md` | Marine | Tracks salinity, temperature variations, and pH logs. |
| 81 | **Vessel Tracker** | `starlight-marine-vessel.md` | Marine | Evaluates AIS transponder signals to log marine reserve encroachments. |
| 82 | **Species Logger** | `starlight-marine-species.md` | Conservation | Logs marine mammal sightings and maps migration pathways. |
| 83 | **Coastal Sentinel** | `starlight-marine-coastal.md` | Marine | Scans satellite views to flag coastal erosion and reef bleaching. |
| 84 | **Dive Planner** | `starlight-marine-dive.md` | Marine | Compiles tide tables, current speeds, and dive safety checklists. |
| 85 | **Pollution Monitor** | `starlight-marine-pollution.md` | Marine | Maps oil spill patterns and registers ocean plastic collection logs. |

### 3.10 Longevity & Health Vertical (7 Agents)
Optimizes physical performance, biomarker tracking, and life extensions.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 86 | **Biomarker Analyst** | `starlight-health-biomarkers.md` | Longevity | Flags hormone, vitamin, and cardiovascular metrics from blood sheets. |
| 87 | **Supplement Advisor** | `starlight-health-supplements.md` | Longevity | Coordinates supplement schedules based on biomarker deficits. |
| 88 | **Sleep Optimizer** | `starlight-health-sleep.md` | Rhythm | Audits sleep cycles, heart rate variability, and bedroom environments. |
| 89 | **Training Planner** | `starlight-health-training.md` | Rhythm | Models resistance workouts, zone-2 cardio plans, and rest steps. |
| 90 | **Longevity Researcher** | `starlight-health-research.md` | Longevity | Reviews clinical longevity studies, peptide trials, and drug guides. |
| 91 | **Dietary Synthesizer** | `starlight-health-diet.md` | Rhythm | Logs caloric intakes, macronutrient profiles, and glucose metrics. |
| 92 | **Stress Tracker** | `starlight-health-stress.md` | Rhythm | Tracks daily stress spikes and schedules breathing sessions. |

### 3.11 Infrastructure & Ops Vertical (7 Agents)
Manages continuous delivery, system resources, and hardware failovers.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 93 | **Deploy Overseer** | `starlight-ops-deploy.md` | Ops | Manages Vercel, Railway, and Cloudflare Workers deploy pipelines. |
| 94 | **Cluster Tuner** | `starlight-ops-cluster.md` | Ops | Tunes Kubernetes node configurations and memory allocations. |
| 95 | **Cost Optimization** | `starlight-ops-cost.md` | Ops | Audits cloud monthly usage and cleans orphaned storage blocks. |
| 96 | **Backup Guard** | `starlight-ops-backup.md` | Ops | Runs automated database backups and validates target checksums. |
| 97 | **CDN Warden** | `starlight-ops-cdn.md` | Ops | Configures Cloudflare caching rules and mitigates DDoS attempts. |
| 98 | **Log Aggregator** | `starlight-ops-logs.md` | Ops | Filters debug logs, alerts on fatal crashes, and archives data. |
| 99 | **Hardware Monitor** | `starlight-ops-hardware.md` | Ops | Tracks local CPU temperatures, fan speeds, and NVMe disk health. |

### 3.12 Partner & Adapter Swarm (10 Agents)
Adapts Starlight to external developer frameworks and AI tool protocols.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 100 | **Nous Hermes Adapter** | `starlight-adapter-hermes.md` | Partner | Imports profiles and kanban tasks from Nous Research Hermes agent. |
| 101 | **Paperclip Broker** | `starlight-adapter-paperclip.md` | Partner | Syncs project task queues and budgets with Paperclip dashboard. |
| 102 | **Mastra Connector** | `starlight-adapter-mastra.md` | Partner | Exposes TypeScript-native tools and agent steps via Mastra. |
| 103 | **Agno Bridge** | `starlight-adapter-agno.md` | Partner | Bridges lightweight Python agents built on Agno framework. |
| 104 | **OpenAI SDK Adapter** | `starlight-adapter-openai.md` | Partner | Formats function call responses for the OpenAI Agents SDK. |
| 105 | **LangGraph Router** | `starlight-adapter-langgraph.md` | Partner | Traces cyclical agent pathways and state branches in LangGraph. |
| 106 | **AutoGen Bridge** | `starlight-adapter-autogen.md` | Partner | Facilitates chat loops between AutoGen conversation nodes. |
| 107 | **CrewAI Orchestrator** | `starlight-adapter-crewai.md` | Partner | Formats goal prompts to invoke CrewAI role-playing agents. |
| 108 | **Dify Sync** | `starlight-adapter-dify.md` | Partner | Exports workflow structures and prompts to Dify visual engines. |
| 109 | **Ollama Localizer** | `starlight-adapter-ollama.md` | Partner | Configures local model configurations and manages GGUF files. |

### 3.13 Research & Publications Vertical (7 Agents)
Tracks scientific publications and manages publishing pipelines.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 110 | **arXiv Scraper** | `starlight-research-arxiv.md` | Research | Scrapes latest machine learning and science preprints from arXiv. |
| 111 | **BioRxiv Scraper** | `starlight-research-biorxiv.md` | Research | Downloads biology preprints and filters them by target tags. |
| 112 | **Europe PMC Fetcher** | `starlight-research-pmc.md` | Research | Queries PubMed IDs and formats citation link trees. |
| 113 | **OpenAlex Aggregator** | `starlight-research-openalex.md` | Research | Aggregates citation metrics, h-indexes, and author lists. |
| 114 | **PDF Distiller** | `starlight-research-distill.md` | Research | Extracts charts and abstracts from scientific PDF documents. |
| 115 | **Markdown Formatter** | `starlight-research-format.md` | Publishing | Formats text columns into clean academic GitHub Markdown. |
| 116 | **Attestation Pinner** | `starlight-research-attest.md` | Publishing | Pins digital signatures and cryptographic hashes onto papers. |

### 3.14 Asset & Production Vertical (7 Agents)
Produces creative images, video assets, and user interface mocks.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 117 | **Midjourney Adapter** | `starlight-asset-midjourney.md` | Asset | Formats cinematic prompts and schedules generation calls. |
| 118 | **Higgsfield Director** | `starlight-asset-higgsfield.md` | Asset | Structures video prompts and edits camera panning metrics. |
| 119 | **Nano Banana Renderer** | `starlight-asset-nb.md` | Asset | Renders flat book cover and thumbnail vectors via nb-image. |
| 120 | **UI Mockup Designer** | `starlight-asset-ui.md` | UI | Generates Tailwind, shadcn, and HTML dashboard frames. |
| 121 | **Video Assembler** | `starlight-asset-video.md` | Asset | Composes keyframe slides, background tunes, and voice tracks. |
| 122 | **Prompt Hub Manager** | `starlight-asset-prompts.md` | Prompt Hub | Optimizes visual prompt parameters and manages presets. |
| 123 | **Quality Checker** | `starlight-asset-quality.md` | Quality | Audits visual outputs to reject blurry panels or text errors. |

### 3.15 Content & Distribution Vertical (7 Agents)
Repackages text ideas into cross-platform marketing campaigns.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 124 | **LinkedIn Formatter** | `starlight-dist-linkedin.md` | Dist | Translates technical whitepapers into business insights. |
| 125 | **X Thread Compiler** | `starlight-dist-x.md` | Dist | Distills complex codebase changes into engaging punchy posts. |
| 126 | **Newsletter Editor** | `starlight-dist-newsletter.md` | Dist | Formats email campaigns, maps banner images, and checks links. |
| 127 | **Instagram Composer** | `starlight-dist-instagram.md` | Dist | Pairs visual tiles with descriptive captions and location logs. |
| 128 | **TikTok Scriptwriter** | `starlight-dist-tiktok.md` | Dist | Drafts fast-paced video narratives and structures B-roll steps. |
| 129 | **SEO Optimizer** | `starlight-dist-seo.md` | Dist | Generates meta titles, descriptions, and structures headers. |
| 130 | **Scheduler Postman** | `starlight-dist-scheduler.md` | Dist | Publishes approved updates to Buffer, n8n, or API hooks. |

### 3.16 Community & Alliance Vertical (7 Agents)
Monitors community boards and evaluates partner integration proposals.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 131 | **GitHub Issue Responder** | `starlight-comm-github.md` | Community | Triages open bug issues, flags repeating bugs, and comments. |
| 132 | **Discord Moderator** | `starlight-comm-discord.md` | Community | Answers general questions and responds to server commands. |
| 133 | **Alliance Assessor** | `starlight-comm-alliance.md` | Alliances | Reviews partner API integration requests against board limits. |
| 134 | **Event Coordinator** | `starlight-comm-events.md` | Community | Coordinates hackathons, workshop calendars, and schedules. |
| 135 | **FAQ Compiler** | `starlight-comm-faq.md` | Community | Updates product guides based on recurring community questions. |
| 136 | **Contributor Warden** | `starlight-comm-contributing.md` | Community | Welcomes new repository forks and audits PR checklist rules. |
| 137 | **Feedback Analyzer** | `starlight-comm-feedback.md` | Community | Measures product sentiment logs and extracts core feature requests. |

### 3.17 Hardware & Device Vertical (7 Agents)
Bridges the digital system with physical server devices and monitors.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 138 | **Smart Meter Bridge** | `starlight-dev-meter.md` | Devices | Scrapes local solar battery stats and uploads CSV summaries. |
| 139 | **Raspberry Pi Monitor** | `starlight-dev-pi.md` | Devices | Logs status statistics for local hardware server endpoints. |
| 140 | **Syncthing Warden** | `starlight-dev-syncthing.md` | Devices | Checks P2P memory folder sync status and resolves duplicate files. |
| 141 | **Audio Capture Hub** | `starlight-dev-audio.md` | Devices | Captures voice recordings from microphone inputs. |
| 142 | **Camera Integrator** | `starlight-dev-camera.md` | Devices | Pulls images from local webcams to verify site status. |
| 143 | **Display Controller** | `starlight-dev-display.md` | Devices | Controls physical HUD monitors or local e-ink status pages. |
| 144 | **Thermal Safety Lock** | `starlight-dev-thermal.md` | Devices | Shuts down background tasks if hardware CPU heat exceeds limits. |

### 3.18 Elder & Council Archetypes (6 Tiers)
Represent cultural, responsibility, and legacy voices inside the Starlight Council.

| # | Agent Name | File / Identifier | Domain | Role / Trigger |
|---|---|---|---|---|
| 145 | **Elder Father** | `council/elder-father.md` | Council | Evaluates proposals for discipline, liability, and long-term legacy. |
| 146 | **Elder Mother** | `council/elder-mother.md` | Council | Evaluates proposals for team health, relations, and beauty. |
| 147 | **Sage Seat** | `council/sage.md` | Council | Evaluates proposals for philosophical meaning and context limits. |
| 148 | **Builder-Elder** | `council/builder-elder.md` | Council | Evaluates proposals for cost, execution speed, and simplicity. |
| 149 | **Shadow Witness** | `council/shadow-witness.md` | Council | Highlights hidden assumptions, ego motives, and security risks. |
| 150 | **Future Self at 90** | `council/future-self-at-90.md` | Council | Focuses on long-horizon life fulfillment and value commitments. |

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, agent-registry]
