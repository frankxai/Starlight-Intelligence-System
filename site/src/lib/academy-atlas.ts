import academyAtlasRecord from "../../../foundry/examples/academy-portfolio-40.reference.json";

export type AcademyPackStatus =
  | "active-public-reference"
  | "validation-bet"
  | "proposed-next"
  | "proposed-option";
export type AcademyLane = "now" | "next" | "later";

export type AcademyHabitat = {
  id: string;
  name: string;
  place: string;
  type: string;
  signal: string;
  url: string;
};

export type AcademyPricingTier = {
  id: string;
  label: string;
  priceHypothesis: string;
  includes: string;
  neverIncludes: string;
};

export type AcademyPack = {
  id: string;
  name: string;
  identity: string;
  status: AcademyPackStatus;
  lane: AcademyLane;
  promise: string;
  persona: {
    ageBand: string;
    stage: string;
    interest: string;
    currentReality: string;
    friction: string;
  };
  habitatIds: string[];
  academicExperience: string;
  communityExperience: string;
  proposedModules: string[];
  freeOutcome: string;
  managedCapacity: string;
  pricingTier: string;
  willingnessHypothesis: string;
  skills: string[];
};

export type AcademyHouse = {
  id: string;
  name: string;
  brandSurface: string;
  accent: "cyan" | "fuchsia" | "violet" | "amber" | "emerald";
  thesis: string;
  communityFormat: string;
  packs: AcademyPack[];
};

export type AcademyAgentCandidate = {
  id: string;
  status: "compiled-candidate-not-activated";
  authority: "draft-only";
  tasks: string[];
  denied: string[];
};

export type AcademyAtlasModel = {
  schemaVersion: string;
  kind: "academy-portfolio-reference";
  id: string;
  release: {
    status: "proposed-reference";
    asOf: string;
    label: string;
    truthBoundary: string;
  };
  portfolio: {
    publicPromise: string;
    thesis: string;
    operatingModel: string;
    topLevelBrandLimit: number;
    packCount: number;
    activePublicReferences: number;
    activeRevenueBets: number;
    brandPolicy: string;
    observed: string[];
    hypothesized: string[];
  };
  openAccess: {
    completeLearningPathWithoutPayment: boolean;
    allModulesAndMissionsPublic: boolean;
    rubricsAndCredentialThresholdsPublic: boolean;
    localOrBringYourOwnKeySupported: boolean;
    learnerExportWithoutPayment: boolean;
    credentialEligibilityWithoutPayment: boolean;
    identicalAssessmentStandardAcrossTiers: boolean;
    accessibilityRequirement: string;
    paidBoundary: string;
  };
  commerce: {
    status: "parked-design";
    agentAuthority: "recommend-only";
    execution: string;
    requiresHumanRatifiedPriceBook: boolean;
    requiresExplicitBuyerConfirmation: boolean;
    entitlementReceiptRequired: boolean;
    crossSubsidyHypothesis: string;
    prohibited: string[];
  };
  activationGate: {
    reviewWindow: string;
    minimumWeeklyActiveLearners: number;
    minimumArtifactCompletionRate: number;
    minimumPeerContributionRate: number;
    minimumIndependentStewards: number;
    requirements: string[];
  };
  pricingTiers: AcademyPricingTier[];
  habitats: AcademyHabitat[];
  agentCandidates: AcademyAgentCandidate[];
  houses: AcademyHouse[];
};

export type AcademyPackView = AcademyPack & {
  houseId: string;
  houseName: string;
  brandSurface: string;
  accent: AcademyHouse["accent"];
  houseThesis: string;
  houseCommunityFormat: string;
};

export const academyAtlasModel = academyAtlasRecord as unknown as AcademyAtlasModel;

export const academyAtlasPacks: AcademyPackView[] = academyAtlasModel.houses.flatMap(
  (house) =>
    house.packs.map((pack) => ({
      ...pack,
      houseId: house.id,
      houseName: house.name,
      brandSurface: house.brandSurface,
      accent: house.accent,
      houseThesis: house.thesis,
      houseCommunityFormat: house.communityFormat,
    })),
);

export const academyHabitatById = new Map(
  academyAtlasModel.habitats.map((habitat) => [habitat.id, habitat]),
);

export const academyPricingById = new Map(
  academyAtlasModel.pricingTiers.map((tier) => [tier.id, tier]),
);
