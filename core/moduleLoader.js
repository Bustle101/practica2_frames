// Модуль для работы с файловой системой (чтение файлов, проверка существования)
const fs = require("fs");

// Модуль для корректной работы с путями файлов (кроссплатформенно)
const path = require("path");

// Импорт функции, которая проверяет, что загруженный файл действительно является модулем
const { assertIsModule } = require("./moduleContract");



// Загрузка модулей по именам

function loadModulesByNames(names, modulesDir) {

  // Map для хранения загруженных модулей
  // ключ = имя модуля
  // значение = сам модуль
  const modules = new Map();

  // перебираем список имён модулей из modules.json
  for (const fileBaseName of names) {

    // строим полный путь к файлу модуля
  
    const fullPath = path.join(modulesDir, `${fileBaseName}.js`);

    // проверяем существует ли файл
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Модуль '${fileBaseName}' не найден: ${fullPath}`);
    }

    // загружаем модуль через require
    const raw = require(fullPath);

    // проверяем что модуль соответствует контракту
    const mod = assertIsModule(raw);

    // проверка на дублирование имён модулей
    if (modules.has(mod.name)) {
      throw new Error(`Дублируется модуль с именем '${mod.name}'`);
    }

    // сохраняем модуль в Map
    modules.set(mod.name, mod);
  }

  // возвращаем Map всех модулей
  return modules;
}



// Сортировка модулей по зависимостям

function sortByDependencies(modulesMap) {
  // Делаем копию зависимостей, чтобы можно было безопасно их изменять
  const remainingDeps = new Map();

  for (const [name, mod] of modulesMap.entries()) {
    // проверка, что все зависимости вообще существуют
    for (const dep of mod.dependencies) {
      if (!modulesMap.has(dep)) {
        throw new Error(`Модуль '${name}' требует '${dep}', но он не загружен`);
      }
    }

    // Кладём копию массива зависимостей
    remainingDeps.set(name, [...mod.dependencies]);
  }

  const orderedNames = [];
  const processed = new Set();

  while (processed.size < modulesMap.size) {
    let foundThisRound = false;

    // Ищем модули, у которых больше не осталось зависимостей
    for (const [name, deps] of remainingDeps.entries()) {
      if (processed.has(name)) {
        continue;
      }

      if (deps.length === 0) {
        // Добавляем модуль в итоговый порядок
        orderedNames.push(name);
        processed.add(name);
        foundThisRound = true;

        // Удаляем этот модуль из зависимостей остальных модулей
        for (const [otherName, otherDeps] of remainingDeps.entries()) {
          if (!processed.has(otherName)) {
            remainingDeps.set(
              otherName,
              otherDeps.filter((dep) => dep !== name)
            );
          }
        }
      }
    }

    // Если за проход не нашли ни одного модуля без зависимостей,
    // значит остался цикл
    if (!foundThisRound) {
      const cycleNodes = [...remainingDeps.entries()]
        .filter(([name]) => !processed.has(name))
        .map(([name, deps]) => `${name} [${deps.join(", ")}]`);

      throw new Error(
        `Обнаружен цикл зависимостей между модулями: ${cycleNodes.join(" -> ")}`
      );
    }
  }

  return orderedNames.map((name) => modulesMap.get(name));
}

// Основная функция загрузки модулей

async function loadModulesFromConfig(container, configPath, modulesDir) {

  // читаем файл modules.json
  const raw = fs.readFileSync(configPath, "utf-8");

  // парсим JSON
  const names = JSON.parse(raw);

  // проверяем что это массив
  if (!Array.isArray(names)) {
    throw new Error("modules.json должен быть массивом имён файлов модулей");
  }

  // загружаем модули из папки modules
  const modulesMap = loadModulesByNames(names, modulesDir);

  // сортируем модули с учётом зависимостей
  const ordered = sortByDependencies(modulesMap);

  // регистрация сервисов модулей в DI контейнере
  for (const mod of ordered) {
    mod.register(container);
  }

  // инициализация модулей
  for (const mod of ordered) {
    await mod.init(container);
  }

  // возвращаем список загруженных модулей
  return ordered.map((m) => m.name);
}


// экспорт функции загрузки модулей
module.exports = { loadModulesFromConfig };