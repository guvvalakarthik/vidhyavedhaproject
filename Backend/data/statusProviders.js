export const STATUS_PROVIDERS = [
  { providerCode: "vidhya-healthcare", label: "Vidhya healthcare appointments", connector: "internal", targetType: "healthcare", official: false },
  { providerCode: "vidhya-roadside", label: "Vidhya roadside dispatch", connector: "internal", targetType: "emergency", official: false },
  { providerCode: "vidhya-home", label: "Vidhya home-service bookings", connector: "internal", targetType: "home-maintenance", official: false },
  { providerCode: "external-government", label: "Government authority status", connector: "not-connected", targetType: "government", official: true },
  { providerCode: "external-education", label: "Education authority status", connector: "not-connected", targetType: "education", official: true },
  { providerCode: "external-finance", label: "Regulated financial provider status", connector: "not-connected", targetType: "finance", official: true },
  { providerCode: "external-farming", label: "Agriculture authority status", connector: "not-connected", targetType: "farming", official: true },
  { providerCode: "external-utilities", label: "Utility provider status", connector: "not-connected", targetType: "utilities", official: true },
  { providerCode: "external-commerce", label: "Consumer or merchant status", connector: "not-connected", targetType: "ecommerce", official: true },
];
export const STATUS_PROVIDER_CODES = STATUS_PROVIDERS.map(({ providerCode }) => providerCode);
