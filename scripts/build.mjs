import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
const root = process.cwd();
const output = path.join(root, "dist");
await fs.mkdir(path.join(output, "assets"), { recursive: true });
for (const file of ["index.html", "style.css", "script.js", "companion.css"])
  await fs.copyFile(file, path.join(output, file));
await fs.cp("User_", path.join(output, "User_"), { recursive: true });
await fs.cp("public/models", path.join(output, "models"), { recursive: true });
let modelVersion = "unconfigured";
try {
  modelVersion = createHash("sha256")
    .update(await fs.readFile("public/models/eku.glb"))
    .digest("hex")
    .slice(0, 12);
} catch {
  console.warn(
    "EKU model is absent: include public/models/eku.glb before server deployment.",
  );
}
await build({
  define: {
    __EKU_MODEL_URL__: JSON.stringify("/models/eku.glb?v=" + modelVersion),
  },
  entryPoints: ["client/eku.js"],
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2022"],
  outfile: path.join(output, "assets/eku.js"),
  sourcemap: false,
  legalComments: "eof",
});
console.log("Built website in dist/");
