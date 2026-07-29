import { answerWithGrounding } from "../services/aiAssistantService.js";

export const askAssistant = async (req, res) => {
  const result = await answerWithGrounding({
    question: req.body.message,
    service: req.body.service,
    language: req.body.language,
    userId: req.user.userId,
  });
  return res.json(result);
};
