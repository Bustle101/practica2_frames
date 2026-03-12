const assert = require("assert");
const path = require("path");
const Container = require("../core/container");
const { loadModulesFromConfig } = require("../core/moduleLoader");

async function testCycleDetection() {
  const container = new Container();

  const configPath = path.join(__dirname, "modules_cycle.json");
  const modulesDir = path.join(__dirname, "test_modules"); 

  try {
    await loadModulesFromConfig(container, configPath, modulesDir);
    assert.fail("Ожидалась ошибка циклических зависимостей");
  } catch (err) {
    assert.ok(
      err.message.toLowerCase().includes("цикл"),
      `Неожиданное сообщение: ${err.message}`
    );
    console.log("testCycleDetection passed");
  }
}

module.exports = testCycleDetection;