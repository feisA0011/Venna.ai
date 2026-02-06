export type OnboardingVenue = {
  venueId: string;
  profile: {
    name: string;
    address: string;
    phone: string;
    languageDefault: string;
  };
  allowedDomains: string[];
  websiteUrl: string;
  escalationInboxEnabled: boolean;
  goLive: boolean;
  updatedAt: number;
};

export function getAllowedDomainsForVenue(venueId: string): string[];
export function updateOnboarding(input: {
  venueId: string;
  patch: Partial<OnboardingVenue> & { profile?: Partial<OnboardingVenue["profile"]> };
}): OnboardingVenue;
export function getOnboardingState(venueId: string): {
  venue: OnboardingVenue;
  steps: Array<{ id: number; label: string; complete: boolean }>;
  checklist: {
    knowledgeApproved: boolean;
    allowedDomainSet: boolean;
    escalationInboxEnabled: boolean;
  };
  canGoLive: boolean;
  docs: { approved: number; pending: number };
};
export function setGoLive(input: { venueId: string; enabled: boolean }): OnboardingVenue;
export function __resetOnboardingStateForTests(): void;
