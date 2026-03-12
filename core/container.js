class Container {
    constructor(){
        // создаем 2 хранилища
        // хранение структуры сервиса
        this.services = new Map();
        // созданные синглтоны-объекты
        this.singletons =  new Map();
    }

    // вставляем всю информацию о сервисе 
    register(name, factory, lifetime = "singleton") {
        this.services.set(name, {factory, lifetime});
    }

    // проверка сервиса 
    resolve(name){
        const service = this.services.get(name);

        if (!service){
            throw new Error(`Сервис ${name} не зарегистрирован`);
        }
        // проверка на синглтон
        if (service.lifetime === "singleton") {
            // создание синглтона
            if (!this.singletons.has(name)) {
                // создание объекта - синглтона в сервисе
                const instance = service.factory(this);
                // вставка в синглтонах
                this.singletons.set(name, instance);
            }
            return this.singletons.get(name);
        }
        if (service.lifetime === "transient"){
            return service.factory(this)
        }
        throw new Error(`Неизвестное время жизни сервиса ${name}`)
    }
}

module.exports = Container;