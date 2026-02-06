const esbuild = require("esbuild");
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.argv.includes("-p")
  ? parseInt(process.argv[process.argv.indexOf("-p") + 1])
  : 3001;

// Build context for watch mode
const build = async () => {
  const ctx = await esbuild.context({
    entryPoints: ["src/boot.ts", "src/ui.ts"],
    outdir: "dist",
    bundle: true,
    minify: false, // easier debugging in dev
    sourcemap: true,
    target: ["es2020"],
  });

  await ctx.watch();
  console.log("📦 Widget building...");

  // Simple static file server
  const server = http.createServer((req, res) => {
    const filePath = path.join(
      __dirname,
      "..",
      "dist",
      req.url === "/" ? "boot.js" : req.url,
    );

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": req.url.endsWith(".js")
          ? "application/javascript"
          : "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Content-Security-Policy": "default-src 'none'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      });
      res.end(data);
    });
  });

  server.listen(port, () => {
    console.log(`✅ Widget server running at http://localhost:${port}`);
    console.log(`   → boot.js available at http://localhost:${port}/boot.js`);
  });
};

build().catch(console.error);
