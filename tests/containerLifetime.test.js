const assert = require("assert");
const Container = require("../core/container");

module.exports = async function testContainerLifetime() {
  const container = new Container();

  let singletonCounter = 0;
  let transientCounter = 0;

  container.register("singleService", () => {
    singletonCounter += 1;
    return { id: singletonCounter };
  }, "singleton");

  container.register("transientService", () => {
    transientCounter += 1;
    return { id: transientCounter };
  }, "transient");

  const s1 = container.resolve("singleService");
  const s2 = container.resolve("singleService");
  assert.strictEqual(s1, s2, "singleton должен возвращать один и тот же объект");

  const t1 = container.resolve("transientService");
  const t2 = container.resolve("transientService");
  assert.notStrictEqual(t1, t2, "transient должен создавать новый объект");

  console.log("testContainerLifetime passed");
};