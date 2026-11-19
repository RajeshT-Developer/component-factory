const { spawnSync } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function run(command, args) {
  console.log("\n> " + command + " " + args.join(" "));
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" && command === "npm" });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
run(process.execPath, ["--test", "tests/unit/table-config.test.mjs", "tests/unit/table-source.test.mjs", "tests/unit/table-consumers.test.mjs"]);
for (const directory of ["apps/workbench", "examples/screen-react", "examples/screen-vue"]) run("npm", ["--prefix", directory, "run", "build"]);
if (process.argv.includes("--browser")) run("npm", ["exec", "--", "playwright", "test", "--config=playwright.screen.config.mjs"]);
if (process.argv.includes("--parity")) run("npm", ["test"]);
console.log("\nRequested checks completed. Checks not requested have not been verified.");
