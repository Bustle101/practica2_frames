
class ModuleContract {

    constructor(name, dependencies = []) {
        if (!name || typeof name !== "string") {
            throw new Error("Модуль должен иметь имя");
        }

        if (!Array.isArray(dependencies)){
            throw new Error (`В модуле ${name}: dependencies должен быть массивом`);
        }

        this.name = name;
        this.dependencies = dependencies;
    }

    register(container){
        throw new Error(`В модуле ${this.name} не реализован метод - register`);

    }

    init(container){
        throw new Error(`В модуле ${this.name} не реализован метод - init`);

    }

    
}




function assertIsModule(mod) {
  if (!mod || typeof mod !== "object") {
    throw new Error("Неверный модуль: ожидается экспорт объекта");
  }
  if (typeof mod.name !== "string" || !mod.name.trim()) {
    throw new Error("Неверный модуль: поле 'name' должно быть непустой строкой");
  }
  if (!Array.isArray(mod.dependencies) || !mod.dependencies.every(d => typeof d === "string")) {
    throw new Error(`Неверный модуль '${mod.name ?? "?"}': поле 'dependencies' должно быть массивом строк`);
  }
  if (typeof mod.register !== "function") {
    throw new Error(`Неверный модуль '${mod.name}': поле 'register' должно быть функцией`);
  }
  if (typeof mod.init !== "function") {
    throw new Error(`Неверный модуль '${mod.name}': поле 'init' должно быть функцией`);
  }
  return mod;
}

module.exports = { ModuleContract, assertIsModule };