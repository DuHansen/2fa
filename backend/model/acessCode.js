const database = require('../config/database');
const User = require('./user'); // Importando o modelo User

class AccessCodeModel {
    constructor() {
        this.model = database.db.define("access_codes", {
            id: {
                type: database.db.Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: database.db.Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: User, // Referência ao modelo User
                    key: 'id',
                },
            },
            codigoAcesso: {
                type: database.db.Sequelize.STRING,
                allowNull: false,
            },
            expiresAt: {
                type: database.db.Sequelize.DATE,
                allowNull: false,
            },
        }, {
            timestamps: true, // Adiciona createdAt e updatedAt
            tableName: 'access_codes', // Define o nome da tabela
        });

        // Definindo a associação
        this.model.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    }
}

module.exports = new AccessCodeModel().model;
