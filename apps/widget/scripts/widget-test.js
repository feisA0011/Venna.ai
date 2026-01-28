const http = require("http");
const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");

const distDir = path.join(__dirname, "..", "dist");

const buildAssets = async () => {
  await esbuild.build({
    entryPoints: ["src/boot.ts"],
    outfile: path.join(distDir, "boot.js"),
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ["es2020"]
  });
  await esbuild.build({
    entryPoints: ["src/ui.ts"],
    outfile: path.join(distDir, "ui.js"),
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ["es2020"]
  });
};

const widgetTestHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Venna Widget Test</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
        padding: 24px;
        background: #f6f6f6;
      }
      .card {
        max-width: 520px;
        background: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Venna Widget Test</h1>
      <p>Use this page to validate the glassy orb + chat UI.</p>
    </div>
    <script
      src="/boot.js"
      data-venue-id="venue_123"
      data-api-base="http://localhost:3000"
    ></script>
    <script>
      window.VennaWidget = window.VennaWidget || {};
      window.VennaWidget.init?.({ accent: "#fe1541", radius: 18 });
    </script>
  </body>
</html>`;

const serveFile = (filePath, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(data);
  });
};

const startServer = () => {
  const server = http.createServer((req, res) => {
    if (req.url === "/" || req.url === "/widget-test") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(widgetTestHtml);
      return;
    }

    if (req.url === "/boot.js") {
      serveFile(path.join(distDir, "boot.js"), res);
      return;
    }

    if (req.url === "/ui.js") {
      serveFile(path.join(distDir, "ui.js"), res);
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  const port = 4170;
  server.listen(port, () => {
    console.log(`Widget test server running at http://localhost:${port}`);
  });
};

buildAssets()
  .then(startServer)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
