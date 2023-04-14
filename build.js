const { build } = require("esbuild");
const path = require("path");
const fs = require("fs");
const util = require("util");
const executeCommand = util.promisify(require("child_process").exec);
var AdmZip = require("adm-zip");
var zip = new AdmZip();
const funcsd = "./src/functions";

const folderList = fs
  .readdirSync(funcsd, { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => item.name);

const entryPoints = folderList.map((item) => `${funcsd}/${item}/handler.ts`);

const zfiles = folderList.map((item) => {
  return [`dist/${item}/handler.js`, `${item}`, `${path.dirname(__filename)}`];
});

const generateFiles = () => {
  zfiles.map(([target, name, projectPath]) => {
    zip.addLocalFile(`${projectPath}/${target}`);
    zip.toBuffer();
    zip.writeZip(`dist/${name}.zip`);
  });
};

build({
  bundle: true,
  target: "node16",
  platform: "node",
  format: "cjs",
  outdir: "dist",
  entryPoints,
  minify: false,
  sourcemap: "external",
  plugins: [],
})
  .then(() => generateFiles())
  .catch((e) => {
    console.log(e);
  });
