require('dotenv').config();
const { Sequelize } = require("sequelize");

class Database {
    constructor() {
        this.init();
    }

    init() {
        this.db = new Sequelize({
            database: process.env.DB_DATABASE,
            host: process.env.DB_HOST,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            dialect: process.env.DB_DIALECT,
        });
    }
}

module.exports = new Database();
