import { GasPlugin } from "esbuild-gas-plugin";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import { parseArgs } from "@std/cli";
import { build, type Plugin } from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { $ } from "https://deno.land/x/dax@0.39.2/mod.ts";

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
          ...denoPlugins(),
          GasPlugin as Plugin,
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
    await $`deno run --allow-env --allow-net --allow-read --allow-sys --allow-write npm:@google/clasp@2.4.2 push -f`
      .stdinText("\n");
    break;
  }

  default: {
    console.error(`Error: Unknown command: ${command}`);
  }
}
