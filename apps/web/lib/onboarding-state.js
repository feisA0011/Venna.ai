import { listDocuments } from "./knowledge-ingestion.js";

const state = globalThis.__vennaOnboardingState ?? {
  venues: {
    "demo-venue": {
      venueId: "demo-venue",
      profile: {
        name: "Demo Venue",
        address: "",
        phone: "",
        languageDefault: "en"
      },
      allowedDomains: ["http://localhost:3002"],
      websiteUrl: "",
      escalationInboxEnabled: false,
      goLive: false,
      updatedAt: Date.now()
    }
  }
};

globalThis.__vennaOnboardingState = state;

const ensureVenue = (venueId) => {
  if (!state.venues[venueId]) {
    state.venues[venueId] = {
      venueId,
      profile: { name: "", address: "", phone: "", languageDefault: "en" },
      allowedDomains: [],
      websiteUrl: "",
      escalationInboxEnabled: false,
      goLive: false,
      updatedAt: Date.now()
    };
  }
  return state.venues[venueId];
};

const isProfileComplete = (profile) =>
  Boolean(profile.name.trim() && profile.address.trim() && profile.phone.trim() && profile.languageDefault.trim());

export const getAllowedDomainsForVenue = (venueId) => ensureVenue(venueId).allowedDomains;

export const updateOnboarding = ({ venueId, patch }) => {
  const venue = ensureVenue(venueId);
  const next = {
    ...venue,
    ...patch,
    profile: {
      ...venue.profile,
      ...(patch.profile ?? {})
    },
    updatedAt: Date.now()
  };
  state.venues[venueId] = next;
  return next;
};

export const getOnboardingState = (venueId) => {
  const venue = ensureVenue(venueId);
  const approvedDocs = listDocuments({ venueId, status: "approved" });
  const pendingDocs = listDocuments({ venueId, status: "pending" });

  const checklist = {
    knowledgeApproved: approvedDocs.length > 0,
    allowedDomainSet: venue.allowedDomains.length > 0,
    escalationInboxEnabled: venue.escalationInboxEnabled
  };

  const steps = [
    {
      id: 1,
      label: "Create venue profile",
      complete: isProfileComplete(venue.profile)
    },
    {
      id: 2,
      label: "Add allowed domains",
      complete: checklist.allowedDomainSet
    },
    {
      id: 3,
      label: "Run website ingestion",
      complete: Boolean(venue.websiteUrl)
    },
    {
      id: 4,
      label: "Review and approve knowledge",
      complete: checklist.knowledgeApproved
    },
    {
      id: 5,
      label: "Generate embed snippet",
      complete: checklist.allowedDomainSet && isProfileComplete(venue.profile)
    },
    {
      id: 6,
      label: "Test widget",
      complete: checklist.allowedDomainSet
    }
  ];

  return {
    venue,
    steps,
    checklist,
    canGoLive: checklist.knowledgeApproved && checklist.allowedDomainSet && checklist.escalationInboxEnabled,
    docs: {
      approved: approvedDocs.length,
      pending: pendingDocs.length
    }
  };
};

export const setGoLive = ({ venueId, enabled }) => {
  const snapshot = getOnboardingState(venueId);
  if (enabled && !snapshot.canGoLive) {
    throw new Error("Go Live prerequisites are incomplete");
  }
  const updated = updateOnboarding({ venueId, patch: { goLive: enabled } });
  return updated;
};

export const __resetOnboardingStateForTests = () => {
  state.venues = {};
};
