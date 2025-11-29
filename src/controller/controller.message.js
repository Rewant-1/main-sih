const MessageService = require("../service/service.message.js");

const createMessage = async (req, res) => {
  try {
    const message = await MessageService.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await MessageService.getMessages(req.query.chatId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessageById = async (req, res) => {
  try {
    const message = await MessageService.getMessageById(req.params.id);
    if (message) {
      res.status(200).json(message);
    } else {
      res.status(404).json({ message: "Message not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMessage = async (req, res) => {
  try {
    const message = await MessageService.updateMessage(req.params.id, req.body);
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await MessageService.deleteMessage(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};
