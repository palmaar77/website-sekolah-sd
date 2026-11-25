// server.js - Startup script untuk cPanel Phusion Passenger (Zenhosta)
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");

// KUNCI PENTING CPANEL: Paksa direktori kerja selalu di folder aplikasi ini
process.chdir(__dirname);

const dev = false;
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({
  dev: false,
  dir: __dirname,
  hostname,
  port,
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        if (parsedUrl.pathname === "/api/health-check") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString(), dir: __dirname }));
          return;
        }
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request:", req.url, err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    server
      .once("error", (err) => {
        console.error("Server error:", err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Server Next.js aktif di port ${port}`);
      });
  })
  .catch((err) => {
    console.error("Gagal memulai Next.js server:", err);
    process.exit(1);
  });

