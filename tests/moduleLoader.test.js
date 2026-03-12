const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Container = require("../core/container");
const { loadModulesFromConfig } = require("../core/moduleLoader");

async function testMainModuleOrder() {
  const container = new Container();

  const configPath = path.join(__dirname, "../modules.json");
  const modulesDir = path.join(__dirname, "../modules");

  const loaded = await loadModulesFromConfig(container, configPath, modulesDir);

  assert.deepStrictEqual(
    loaded,
    ["LoggerModule", "ValidationModule", "ReportModule", "ExportModule"]
  );

  console.log("testMainModuleOrder passed");
}

async function testAlternativeValidOrder() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "modules-valid-"));
  const configPath = path.join(tmpDir, "modules_valid_alt.json");

  fs.writeFileSync(
    configPath,
    JSON.stringify(["reportModule", "loggerModule"], null, 2),
    "utf-8"
  );

  const container = new Container();
  const modulesDir = path.join(__dirname, "../modules");

  const loaded = await loadModulesFromConfig(container, configPath, modulesDir);

  assert.deepStrictEqual(
    loaded,
    ["LoggerModule", "ReportModule"]
  );

  console.log("testAlternativeValidOrder passed");
}

module.exports = async function testModuleLoader() {
  await testMainModuleOrder();
  await testAlternativeValidOrder();
};