const { randomUUID } = require("crypto");

// шаблон ответа
function sendJson(res, statusCode, payload){ // ответ, статус ответа и данные, которые отправим
    const body = JSON.stringify(payload);// превращаем JSON в строку

    res.writeHead(statusCode,{ 
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(body), // длина ответа в байтах
    });
    res.end(body);
}

// считывание запроса
function readJsonBody(req){
    return new Promise ( (resolve, reject) => {
        let data = '';
        req.on("data", chunk => (data += chunk)) // on - обработчик события
        req.on("end", () => {
            if (!data) return resolve(null) // закрываем промис, если данных нет
            try{
                resolve(JSON.parse(data));

            }
            catch {
                reject(Object.assign(new Error("Invalid JSON"), { code: "BAD_JSON" }));
            }
        });
        req.on("error",reject)
    });
}

// тело запроса и ответа
function createContext(req,res){
    return{
        id: randomUUID(),
        req,
        res,
        request:{
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: null,
        },
        response: {
            status: 200,
            headers: {},
            body: null,
        },
        startNs: process.hrtime.bigint(), 

    }
}



module.exports = { sendJson, readJsonBody, createContext };
