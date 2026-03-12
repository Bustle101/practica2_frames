const http = require("http");
const path = require("path");
const Container = require("./core/container");
const { loadModulesFromConfig } = require("./core/moduleLoader");
const { createContext, readJsonBody, sendJson } = require("./httpResponse");

const PORT = 3000;

function tryResolve(container, name) {
  try {
    return container.resolve(name);
  } catch {
    return null;
  }
}

async function bootstrap() {
  const container = new Container();

  const configPath = path.join(__dirname, "modules.json");
  const modulesDir = path.join(__dirname, "modules");

  const loaded = await loadModulesFromConfig(container, configPath, modulesDir);
  console.log("Loaded modules:", loaded.join(", "));

  const server = http.createServer(async (req, res) => {
    const context = createContext(req, res);
    context.container = container;
    // обработка запроса
    try {
      if (["POST"].includes(context.request.method)) {
        context.request.body = await readJsonBody(req);
      }

      // Вызов модулей
      const logger = tryResolve(container, "logger");
      const validator = tryResolve(container, "validator");
      const reportService = tryResolve(container, "reportService");
      const exporter = tryResolve(container, "exporter");

      logger?.log(`${context.request.method} ${context.request.url} received`);

      
      if (context.request.body !== null) {
        if (validator) {
          validator.validate(context.request.body);
          logger?.log("Validation OK");
        } else {
          logger?.log("Validator not registered");
        }

        if (reportService) {
          reportService.addRecord(context.request.body);
          logger?.log("Record added to report");
        } else {
          logger?.log("ReportService not registered");
        }
      } else {
        logger?.log("Request has no body");
      }

      let exportedTo = null;
      if (exporter && reportService) {
        exportedTo = exporter.write(reportService.getReport());
        logger?.log(`Export OK: ${exportedTo}`);
      } else {
        logger?.log("Exporter or ReportService not registered");
      }

      return sendJson(res, 200, {
        ok: true,
        method: context.request.method,
        url: context.request.url,
        report: reportService ? reportService.getReport() : null,
        exportedTo,
        requestId: context.id,
      });

    } catch (err) {
      sendJson(res, 400, {
        error: {
          code: err.code || "INTERNAL_ERROR",
          message: err.message || "Unexpected error",
        },
        requestId: context.id,
      });
    }
  });

  server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}

bootstrap().catch((e) => {
  console.error("BOOTSTRAP FAILED:", e.message);
  process.exit(1);
});