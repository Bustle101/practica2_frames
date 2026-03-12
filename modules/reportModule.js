const { ModuleContract } = require("../core/moduleContract");

class ReportModule extends ModuleContract {
  constructor() {
    super("ReportModule", ["LoggerModule"]);
  }

  register(container) {
    container.register("reportService", (c) => {
      const logger = c.resolve("logger");

      const records = [];
      return {
        addRecord(item) {
          logger.log("Adding record to report");
          records.push({
            ...item,
            ts: new Date().toISOString()
          });
        },
        getReport() {
          return {
            total: records.length,
            records
          };
        }
      };
    }, "singleton");
  }

  init() {}
}

module.exports = new ReportModule();