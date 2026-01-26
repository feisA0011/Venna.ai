const esbuild = require("esbuild");

const build = async () => {
  await esbuild.build({
    entryPoints: ["src/boot.ts"],
    outfile: "dist/boot.js",
    bundle: true,
    minify: true,
    target: ["es2020"]
  });
  await esbuild.build({
    entryPoints: ["src/ui.ts"],
    outfile: "dist/ui.js",
    bundle: true,
    minify: true,
    target: ["es2020"]
  });
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
