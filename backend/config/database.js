const { Sequelize } = require("sequelize");

class Database {
    constructor() {
        this.init();
    }

    init(){
        this.db = new Sequelize({
            database: "api-2fa",
            host: "localhost",
            username: "root",
            password: "",
            dialect: "mysql"
        })
    }
}

module.exports = new Database();