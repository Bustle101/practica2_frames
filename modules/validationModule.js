const { ModuleContract } = require("../core/moduleContract");

class ValidationModule extends ModuleContract {
  constructor() {
    super("ValidationModule", ["LoggerModule"]);
  }

  register(container) {
    container.register("validator", (c) => {
      const logger = c.resolve("logger");

      return {
        validate(body) {
          logger.log("Validating body");

          if (!body || typeof body !== "object") {
            const e = new Error("Тело запроса обязательно");
            e.code = "VALIDATION_ERROR";
            throw e;
          }

          if (typeof body.book !== "string" || !body.book.trim()) {
            const e = new Error("Поле 'book' обязательно");
            e.code = "VALIDATION_ERROR";
            throw e;
          }

          if (typeof body.price !== "number") {
            const e = new Error("Поле 'price' должно быть числом");
            e.code = "VALIDATION_ERROR";
            throw e;
          }
        }
      };
    }, "singleton");
  }

  init(container) {
    container.resolve("validator");
  }
}

module.exports = new ValidationModule();