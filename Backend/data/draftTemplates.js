export const DRAFT_TYPES = ["application", "complaint", "service-request", "follow-up"];

const common = {
  application: {
    label: "Application",
    purpose: "Request consideration for a service, benefit, admission, or programme.",
    opening: "I am writing to request consideration for the service described below.",
  },
  complaint: {
    label: "Complaint",
    purpose: "Record a problem, the steps already taken, and the resolution requested.",
    opening: "I am writing to formally report the issue described below and request a fair resolution.",
  },
  "service-request": {
    label: "Service request",
    purpose: "Ask a provider or authority to arrange a supported service.",
    opening: "I am writing to request the service described below.",
  },
  "follow-up": {
    label: "Follow-up",
    purpose: "Follow up on a previously submitted request without claiming its status.",
    opening: "I am writing to follow up on my earlier request and ask for an update from the responsible office.",
  },
};

const serviceRecipients = {
  government: "The responsible government office",
  education: "The responsible education institution or authority",
  finance: "The responsible bank, insurer, or regulated financial provider",
  farming: "The responsible agriculture office or programme authority",
  healthcare: "The responsible healthcare provider",
  emergency: "The responsible roadside assistance provider",
  utilities: "The responsible utility provider or grievance office",
  ecommerce: "The responsible merchant, payment provider, or consumer grievance office",
  "home-maintenance": "The responsible home-service provider",
};

export const DRAFT_TEMPLATES = Object.fromEntries(
  Object.entries(serviceRecipients).map(([serviceCode, recipient]) => [
    serviceCode,
    {
      recipient,
      types: DRAFT_TYPES.map((draftType) => ({
        draftType,
        ...common[draftType],
      })),
    },
  ]),
);

export const draftTemplate = (serviceCode, draftType) => {
  const service = DRAFT_TEMPLATES[serviceCode];
  const type = service?.types.find((item) => item.draftType === draftType);
  return service && type ? { recipient: service.recipient, ...type } : null;
};
