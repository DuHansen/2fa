const User = require("../model/user");
const AccessCode = require("../model/acessCode"); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const salts = 12;

// Configuração do Nodemailer com Mailtrap
const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: "38b4b021c3437f",
        pass: "fec849c6bd21da" // Insira sua senha real aqui
    }
});

class UserController {
  async validateAccessCode(userId, codigoAcesso) {
    // Verifica se userId é um número
    if (isNaN(userId)) {
        throw new Error("userId deve ser um número.");
    }

    // Realiza a consulta para encontrar o código de acesso
    const accessCode = await AccessCode.findOne({ where: { userId, codigoAcesso } });

    if (!accessCode) {
        throw new Error("Código de acesso inválido.");
    }

    const now = new Date();
    if (now > accessCode.expiresAt) {
        throw new Error("Código de acesso expirado.");
    }

    return accessCode; 
}


    async createUser(name, email, password) {
        if (!name || !email || !password) {
            throw new Error("name, email e password são obrigatórios.");
        }

        const passwordHashed = await bcrypt.hash(password, salts);

        const userValue = await User.create({
            name,
            email,
            password: passwordHashed,
        });

        return userValue;
    }

    async findUser(id) {
        if (id === undefined) {
            throw new Error("Id é obrigatório.");
        }

        const userValue = await User.findByPk(id);

        if (!userValue) {
            throw new Error("Usuário não encontrado.");
        }

        return userValue;
    }

    async update(id, name, email, password) {
        const oldUser = await this.findUser(id); // Utilize a função findUser

        if (email) {
            const sameEmail = await User.findOne({ where: { email } });
            if (sameEmail && sameEmail.id !== id) {
                throw new Error("Email já cadastrado.");
            }
        }

        const passwordHashed = password ? await bcrypt.hash(password, salts) : oldUser.password;
        oldUser.name = name || oldUser.name;
        oldUser.email = email || oldUser.email;
        oldUser.password = passwordHashed;

        await oldUser.save();

        return oldUser;
    }

    async delete(id) {
        if (id === undefined) {
            throw new Error("Id é obrigatório.");
        }

        const userValue = await this.findUser(id);
        await userValue.destroy();
    }

    async findAll() {
        return User.findAll();
    }

    async login(email, password) {
      const userLogged = await User.findOne({ where: { email } });
  
      if (!userLogged) {
          throw new Error("Email ou senha inválido. Tente novamente.");
      }
  
      const validPassword = await bcrypt.compare(password, userLogged.password);
  
      if (!validPassword) {
          throw new Error("Email ou senha inválido. Tente novamente.");
      }
  
      const token = jwt.sign(
          { id: userLogged.id, email: userLogged.email },
          'MeuSegredo123!'
      );
  
      return { token, userLogged }; // Retornando o usuário logado
  }
  
    async storeAccessCode(userId, codigoAcesso) {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expira em 10 minutos

        await AccessCode.create({
            userId,
            codigoAcesso,
            expiresAt,
        });
    }

    async sendAccessCode(email, codigoAcesso) {
        await transport.sendMail({
            from: '"Seu Nome" <seuemail@dominio.com>', // Remetente
            to: email, // Destinatário
            subject: 'Seu Código de Acesso',
            text: `Seu código de acesso é: ${codigoAcesso}`,
        });
    }
}

module.exports = new UserController();
