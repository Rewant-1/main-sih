const ChatService = require("../service/service.chat.js");

const createChat = async (req, res) => {
  try {
    const chat = await ChatService.createChat(req.body);
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await ChatService.getChats();
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await ChatService.getChatById(req.params.id);
    if (chat) {
      res.status(200).json(chat);
    } else {
      res.status(404).json({ message: "Chat not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateChat = async (req, res) => {
  try {
    const chat = await ChatService.updateChat(req.params.id, req.body);
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    await ChatService.deleteChat(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
};

