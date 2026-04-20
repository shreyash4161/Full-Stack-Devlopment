const cookie = require("cookie");
const User = require("../models/User");
const { verifyToken, COOKIE_NAME } = require("./tokenService");
const chatService = require("./chatService");
const { markOffline } = require("./authService");

const onlineUsers = new Map();

function getSocketToken(handshake) {
  const authHeader = handshake.auth?.token;
  if (authHeader) return authHeader;
  const parsed = cookie.parse(handshake.headers.cookie || "");
  return parsed[COOKIE_NAME];
}

function initializeSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = getSocketToken(socket.handshake);
      if (!token) {
        next();
        return;
      }

      const payload = verifyToken(token);
      socket.user = await User.findById(payload.sub);
      next();
    } catch (_error) {
      next();
    }
  });

  io.on("connection", async (socket) => {
    if (socket.user) {
      const userId = String(socket.user._id);
      const count = onlineUsers.get(userId) || 0;
      onlineUsers.set(userId, count + 1);
      socket.join(`user:${userId}`);
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeenAt: new Date() });
      io.emit("presence:update", { userId, isOnline: true });
    }

    socket.on("chat:join", (roomId) => {
      socket.join(roomId);
    });

    socket.on("chat:send", async (payload) => {
      if (!socket.user) return;

      const message = await chatService.saveMessage({
        roomId: payload.roomId,
        listingId: payload.listingId,
        senderId: socket.user._id,
        receiverId: payload.receiverId,
        content: payload.content
      });

      io.to(payload.roomId).emit("chat:message", message);
      io.to(`user:${payload.receiverId}`).emit("notification:new", {
        title: "New message",
        body: payload.content
      });
    });

    socket.on("disconnect", async () => {
      if (!socket.user) return;

      const userId = String(socket.user._id);
      const nextCount = Math.max(0, (onlineUsers.get(userId) || 1) - 1);

      if (nextCount === 0) {
        onlineUsers.delete(userId);
        await markOffline(userId);
        io.emit("presence:update", { userId, isOnline: false });
      } else {
        onlineUsers.set(userId, nextCount);
      }
    });
  });
}

module.exports = {
  initializeSocket
};
