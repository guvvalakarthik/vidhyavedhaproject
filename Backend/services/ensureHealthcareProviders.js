import HealthcareProvider from "../models/HealthcareProvider.js";
import { DEFAULT_HEALTHCARE_PROVIDERS } from "../data/healthcareProviders.js";

export const ensureDefaultHealthcareProviders = async () => {
  await HealthcareProvider.bulkWrite(
    DEFAULT_HEALTHCARE_PROVIDERS.map((provider) => ({
      updateOne: {
        filter: { providerCode: provider.providerCode },
        update: { $setOnInsert: provider },
        upsert: true,
      },
    })),
  );
};