import EmergencyRequest from "../models/EmergencyRequest.js";
import HealthcareAppointment from "../models/HealthcareAppointment.js";
import HomeServiceBooking from "../models/HomeServiceBooking.js";
import { STATUS_PROVIDERS } from "../data/statusProviders.js";

const connectors = new Map();
const internalModels = {
  "vidhya-healthcare": { model: HealthcareAppointment, id: "confirmationCode" },
  "vidhya-roadside": { model: EmergencyRequest, id: "requestId" },
  "vidhya-home": { model: HomeServiceBooking, id: "bookingCode" },
};
for (const [code, config] of Object.entries(internalModels)) {
  connectors.set(code, async ({ targetId, userId }) => {
    const item = await config.model.findOne({ [config.id]: targetId, userId });
    if (!item) return null;
    return { currentStatus: item.status, statusMessage: "Status read from the owned Vidhya service record.", sourceUpdatedAt: item.updatedAt };
  });
}
export const registerStatusConnector = (providerCode, adapter) => {
  const provider = STATUS_PROVIDERS.find((item) => item.providerCode === providerCode);
  if (!provider?.official) throw new Error("Only reviewed official providers can receive external adapters.");
  connectors.set(providerCode, adapter);
};
export const readProviderStatus = async ({ providerCode, targetId, userId }) => {
  const provider = STATUS_PROVIDERS.find((item) => item.providerCode === providerCode);
  if (!provider) return null;
  const adapter = connectors.get(providerCode);
  if (!adapter) return { provider, connector: "not-connected", currentStatus: "not-connected", statusMessage: "No verified official API connector is configured. Check the responsible authority directly.", sourceUpdatedAt: null };
  const result = await adapter({ targetId, userId });
  return result ? { provider, connector: provider.official ? "official-api" : "internal", ...result } : null;
};
