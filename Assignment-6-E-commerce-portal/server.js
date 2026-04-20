require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const { connectDatabase } = require("./src/config/db");
const { initializeSocket } = require("./src/services/socketService");

const PORT = Number(process.env.PORT || 3000);
const MAX_PORT_RETRIES = 10;

function listenWithFallback(startPort, retries = MAX_PORT_RETRIES) {
  return new Promise((resolve, reject) => {
    const httpServer = createServer(app);
    const io = new Server(httpServer);

    initializeSocket(io);
    app.locals.io = io;

    httpServer
      .listen(startPort, () => {
        console.log(`Resellr marketplace is running on http://localhost:${startPort}`);
        resolve({ httpServer, port: startPort });
      })
      .on("error", (error) => {
        if (error.code === "EADDRINUSE" && retries > 0) {
          console.log(`Port ${startPort} is busy. Retrying on ${startPort + 1}...`);
          io.close();
          resolve(listenWithFallback(startPort + 1, retries - 1));
          return;
        }

        io.close();
        reject(error);
      });
  });
}

async function bootstrap() {
  await connectDatabase();
  await listenWithFallback(PORT);
}

bootstrap().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});
