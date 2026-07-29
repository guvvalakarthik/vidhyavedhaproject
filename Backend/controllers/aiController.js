import mongoose from "mongoose";
import AiConversation from "../models/AiConversation.js";
import AiMessage from "../models/AiMessage.js";
import { answerWithGrounding } from "../services/aiAssistantService.js";
import { conversationExpiry, conversationTitleFrom } from "../services/conversationService.js";

const publicConversation = (conversation) => ({
  conversationId: conversation._id,
  title: conversation.title,
  service: conversation.service,
  language: conversation.language,
  lastActivityAt: conversation.lastActivityAt,
  expiresAt: conversation.expiresAt,
  createdAt: conversation.createdAt,
});

const publicMessage = (message) => ({
  messageId: message._id,
  role: message.role,
  content: message.content,
  citations: message.citations || [],
  mode: message.mode,
  model: message.model || null,
  createdAt: message.createdAt,
});

const ownedConversation = async (conversationId, userId) => {
  if (!mongoose.isValidObjectId(conversationId)) return null;
  return AiConversation.findOne({ _id: conversationId, userId });
};

export const askAssistant = async (req, res) => {
  const result = await answerWithGrounding({
    question: req.body.message,
    service: req.body.service,
    language: req.body.language,
    userId: req.user.userId,
  });
  return res.json(result);
};

export const createConversation = async (req, res) => {
  const conversation = await AiConversation.create({
    userId: req.user.userId,
    title: req.body.title || "New conversation",
    service: req.body.service,
    language: req.body.language,
    expiresAt: conversationExpiry(),
  });
  return res.status(201).json({ conversation: publicConversation(conversation), messages: [] });
};

export const listConversations = async (req, res) => {
  const conversations = await AiConversation.find({ userId: req.user.userId })
    .sort({ lastActivityAt: -1 })
    .limit(50);
  return res.json({ conversations: conversations.map(publicConversation) });
};

export const getConversation = async (req, res) => {
  const conversation = await ownedConversation(req.params.conversationId, req.user.userId);
  if (!conversation) return res.status(404).json({ error: "Conversation not found." });
  const messages = await AiMessage.find({
    conversationId: conversation._id,
    userId: req.user.userId,
  }).sort({ createdAt: 1 }).limit(200);
  return res.json({
    conversation: publicConversation(conversation),
    messages: messages.map(publicMessage),
  });
};

export const sendConversationMessage = async (req, res) => {
  const conversation = await ownedConversation(req.params.conversationId, req.user.userId);
  if (!conversation) return res.status(404).json({ error: "Conversation not found." });

  const previousMessages = await AiMessage.find({
    conversationId: conversation._id,
    userId: req.user.userId,
  }).sort({ createdAt: -1 }).limit(10).lean();
  const expiresAt = conversationExpiry();
  const userMessage = await AiMessage.create({
    conversationId: conversation._id,
    userId: req.user.userId,
    role: "user",
    content: req.body.message,
    mode: "user",
    expiresAt,
  });

  const result = await answerWithGrounding({
    question: req.body.message,
    service: conversation.service,
    language: conversation.language,
    userId: req.user.userId,
    history: previousMessages.reverse().map(({ role, content }) => ({ role, content })),
  });
  const assistantMessage = await AiMessage.create({
    conversationId: conversation._id,
    userId: req.user.userId,
    role: "assistant",
    content: result.answer,
    citations: result.citations,
    mode: result.mode,
    model: result.model,
    expiresAt,
  });
  await AiMessage.updateMany(
    {
      conversationId: conversation._id,
      userId: req.user.userId,
      expiresAt: { $lt: expiresAt },
    },
    { $set: { expiresAt } },
  );

  if (conversation.title === "New conversation") {
    conversation.title = conversationTitleFrom(req.body.message);
  }
  conversation.lastActivityAt = new Date();
  conversation.expiresAt = expiresAt;
  await conversation.save();

  return res.status(201).json({
    conversation: publicConversation(conversation),
    userMessage: publicMessage(userMessage),
    assistantMessage: publicMessage(assistantMessage),
  });
};

export const deleteConversation = async (req, res) => {
  const conversation = await ownedConversation(req.params.conversationId, req.user.userId);
  if (!conversation) return res.status(404).json({ error: "Conversation not found." });
  await AiMessage.deleteMany({ conversationId: conversation._id, userId: req.user.userId });
  await conversation.deleteOne();
  return res.json({ message: "Conversation deleted." });
};
