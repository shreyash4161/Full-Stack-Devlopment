const Message = require("../models/Message");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { createNotification } = require("./notificationService");

function buildRoomId(listingId, buyerId, sellerId) {
  return [String(listingId), String(buyerId), String(sellerId)].join(":");
}

async function ensureChatParticipants(listingId, currentUserId, explicitSellerId, explicitBuyerId) {
  const listing = await Listing.findById(listingId).populate("seller");
  if (!listing) {
    const error = new Error("Listing not found.");
    error.statusCode = 404;
    throw error;
  }

  const sellerId = explicitSellerId || String(listing.seller._id);
  const seller = await User.findById(sellerId);
  if (!seller) {
    const error = new Error("Seller not found.");
    error.statusCode = 404;
    throw error;
  }

  const isSellerView = String(currentUserId) === String(seller._id);
  const buyerId = isSellerView ? explicitBuyerId || null : String(currentUserId);
  const partner = isSellerView && buyerId ? await User.findById(buyerId) : seller;

  return {
    listing,
    seller,
    buyerId,
    partner,
    roomId: buyerId ? buildRoomId(listingId, buyerId, seller._id) : null
  };
}

async function getRoomMessages(roomId) {
  return Message.find({ roomId }).sort({ createdAt: 1 }).populate("sender receiver").lean();
}

async function getInbox(userId) {
  const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
    .sort({ createdAt: -1 })
    .populate("listing sender receiver")
    .lean();

  const seen = new Set();
  return messages
    .filter((message) => {
      if (seen.has(message.roomId)) return false;
      seen.add(message.roomId);
      return true;
    })
    .map((message) => {
      const [, buyerId, sellerId] = String(message.roomId).split(":");
      return {
        ...message,
        buyerId,
        sellerId,
        partnerName: String(userId) === sellerId ? message.sender?.name || message.receiver?.name : message.receiver?.name || message.sender?.name
      };
    });
}

async function saveMessage({ roomId, listingId, senderId, receiverId, content }) {
  const message = await Message.create({
    roomId,
    listing: listingId,
    sender: senderId,
    receiver: receiverId,
    content
  });

  await createNotification({
    user: receiverId,
    type: "message",
    title: "New message received",
    body: content.slice(0, 80),
    link: `/chat/${listingId}?room=${roomId}`
  });

  return Message.findById(message._id).populate("sender receiver").lean();
}

module.exports = {
  buildRoomId,
  ensureChatParticipants,
  getRoomMessages,
  getInbox,
  saveMessage
};
