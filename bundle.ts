const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"));
const version: string = pkg.version || "0.0.0";

const buildDir = path.join(__dirname, "build");
const releaseDir = path.join(__dirname, "release");
const outFile = path.join(releaseDir, `thunderbird-ai-compose-v${version}.xpi`);

function run(): void {
  if (!fs.existsSync(buildDir)) {
    console.error("❌ Build directory not found. Run `npm run build` first.");
    process.exit(1);
  }

  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir);
  }

  try {
    const zip = new AdmZip();
    zip.addLocalFolder(buildDir);
    zip.writeZip(outFile);
    console.log(`✅ Bundle created at ${outFile}`);
  } catch (err) {
    console.error("❌ Failed to create bundle:", err);
    process.exit(1);
  }
}

run();
