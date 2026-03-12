const assert = require("assert");
const path = require("path");
const Container = require("../core/container");
const { loadModulesFromConfig } = require("../core/moduleLoader");

module.exports = async function testMissingModule() {
  const container = new Container();

  const configPath = path.join(__dirname, "modules_missing.json");
  const modulesDir = path.join(__dirname, "../modules");

  try {
    await loadModulesFromConfig(container, configPath, modulesDir);
    assert.fail("Ожидалась ошибка отсутствующего модуля");
  } catch (err) {
  
    assert.ok(
      err.message.includes("не найден"),
      `Сообщение: ${err.message}`
    );
    console.log("testMissingModule passed");
  }
};