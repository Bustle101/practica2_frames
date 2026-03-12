const assert = require("assert");
const path = require("path");
const Container = require("../core/container");
const { loadModulesFromConfig } = require("../core/moduleLoader");

module.exports = async function testDiContainer() {
  const container = new Container();

  const configPath = path.join(__dirname, "../modules.json");
  const modulesDir = path.join(__dirname, "../modules");

  await loadModulesFromConfig(container, configPath, modulesDir);

  const logger1 = container.resolve("logger");
  const logger2 = container.resolve("logger");
  assert.strictEqual(logger1, logger2, "logger должен быть singleton");

  const report1 = container.resolve("reportService");
  const report2 = container.resolve("reportService");
  assert.strictEqual(report1, report2, "report должен быть singleton");

  const validator1 = container.resolve("validator");
  const validator2 = container.resolve("validator");
  assert.strictEqual(validator1, validator2, "validator должен быть singleton");

  const originalLog = logger1.log;
  const messages = [];
  logger1.log = (msg) => messages.push(msg);

  report1.addRecord({ book: "", price: 120 });

  assert.ok(
    messages.includes("Adding record to report"),
    "reportService должен использовать logger из контейнера"
  );

  logger1.log = originalLog;

  console.log("testDiContainer passed");
};