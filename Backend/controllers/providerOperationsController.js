import { getProviderOperations } from "../services/providerOperationsService.js";
export const dashboard = async (_req, res) => res.json(await getProviderOperations());
