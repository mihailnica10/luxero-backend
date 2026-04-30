import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [resolve(__dirname, "src/index.ts")],
  bundle: true,
  outfile: resolve(__dirname, "dist/index.js"),
  format: "esm",
  platform: "node",
  target: "node18",
  external: ["mongoose", "jsonwebtoken", "bcryptjs", "nodemailer", "@react-email/*", "resend"],
  sourcemap: false,
  minify: false,
});
