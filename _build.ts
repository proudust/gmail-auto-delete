import { GasPlugin } from "esbuild-gas-plugin";
import { denoPlugin } from "@deno/esbuild-plugin";
import { parseArgs } from "@std/cli";
import { build, type Plugin } from "esbuild";
import { $ } from "@david/dax";

const command = parseArgs(Deno.args, {})._[0] || "build";
switch (command) {
  case "build": {
    await Promise.all([
      build({
        bundle: true,
        charset: "utf8",
        entryPoints: ["main.ts"],
        outfile: "dist/out.js",
        target: "es2017", // Workaround for jquery/esprima#2034
        plugins: [
          denoPlugin(),
          GasPlugin as unknown as Plugin,
        ],
      }),
      (async function copy() {
        await Deno.mkdir("dist", { recursive: true });
        await Deno.copyFile("appsscript.json", "dist/appsscript.json");
      })(),
    ]);
    Deno.exit();
    break;
  }

  case "deploy": {
    await $`deno run --allow-env --allow-net --allow-read --allow-sys @google/clasp push -f`;
    break;
  }

  default: {
    console.error(`Error: Unknown command: ${command}`);
  }
}
