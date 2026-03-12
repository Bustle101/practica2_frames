const testModuleLoader = require("./moduleLoader.test");
const testMissingModule = require("./missingModule.test");
const testCycleDetection = require("./cycleModule.test");
const testDiContainer = require("./diContainer.test");
const testContainerLifetime = require("./containerLifetime.test");

async function run() {
  await testModuleLoader();
  await testMissingModule();
  await testCycleDetection();
  await testDiContainer();
  await testContainerLifetime();

  console.log("\nВсе тесты прошли успешно");
}

run().catch((err) => {
  console.error("Тесты упали:", err);
  process.exit(1);
});