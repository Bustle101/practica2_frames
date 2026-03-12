const { ModuleContract } = require("../core/moduleContract");

class LoggerModule extends ModuleContract {
  constructor() {
    super("LoggerModule", []);
  }

  register(container) {
    container.register("logger", () => ({
      log(message) {
        console.log("[LOG]:", message);
      }
    }), "singleton");
  }

  init(container) {
    const logger = container.resolve("logger");
    logger.log("LoggerModule initialized");
  }
}

module.exports = new LoggerModule();