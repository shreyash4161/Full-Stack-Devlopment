const { validationResult } = require("express-validator");
const chatService = require("../services/chatService");

async function renderInbox(req, res) {
  const conversations = await chatService.getInbox(req.currentUser._id);
  res.render("chat", {
    pageTitle: "Inbox",
    conversations,
    activeRoom: null,
    roomMessages: [],
    listingId: ""
  });
}

async function renderRoom(req, res) {
  const { listing, seller, buyerId, roomId, partner } = await chatService.ensureChatParticipants(
    req.params.listingId,
    req.currentUser._id,
    req.query.seller,
    req.query.buyer
  );

  if (!roomId) {
    return res.redirect("/dashboard?error=Open the listing from a buyer account to start chat");
  }

  const [conversations, roomMessages] = await Promise.all([
    chatService.getInbox(req.currentUser._id),
    chatService.getRoomMessages(roomId)
  ]);

  res.render("chat", {
    pageTitle: `Chat about ${listing.title}`,
    conversations,
    activeRoom: {
      roomId,
      listing,
      seller,
      buyerId,
      partner
    },
    roomMessages,
    listingId: req.params.listingId
  });
}

async function postMessage(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg });
  }

  const message = await chatService.saveMessage({
    roomId: req.body.roomId,
    listingId: req.body.listingId,
    senderId: req.currentUser._id,
    receiverId: req.body.receiverId,
    content: req.body.content
  });

  req.app.locals.io.to(req.body.roomId).emit("chat:message", message);
  req.app.locals.io.to(`user:${req.body.receiverId}`).emit("notification:new", {
    title: "New message",
    body: req.body.content
  });

  res.json({ message });
}

module.exports = {
  renderInbox,
  renderRoom,
  postMessage
};
