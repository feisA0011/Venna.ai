const esbuild = require("esbuild");

const shared = {
  bundle: true,
  sourcemap: true,
  target: ["es2020"]
};

Promise.all([
  esbuild.context({
    entryPoints: ["src/boot.ts"],
    outfile: "dist/boot.js",
    ...shared
  }),
  esbuild.context({
    entryPoints: ["src/ui.ts"],
    outfile: "dist/ui.js",
    ...shared
  })
])
  .then(async (contexts) => {
    await Promise.all(contexts.map((ctx) => ctx.watch()));
    console.log("Widget build running...");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
