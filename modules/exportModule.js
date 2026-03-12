const fs = require("fs");
const path = require("path");
const { ModuleContract } = require("../core/moduleContract");

class ExportModule extends ModuleContract {
  constructor() {
    super("ExportModule", ["LoggerModule", "ReportModule"]);
  }

  register(container) {
    container.register("exporter", (c) => {
      const logger = c.resolve("logger");

      return {
        write(report) {
          const outPath = path.join(process.cwd(), "export_report.json");
          fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");
          logger.log(`Report exported to ${outPath}`);
          return outPath;
        }
      };
    }, "singleton");
  }

  init() {}
}

module.exports = new ExportModule();