const UserController = require('../controller/user');
const jwt = require('jsonwebtoken');

class UserApi {
    async validateAccessCode(req, res) {
        const { userId, codigoAcesso } = req.body;
        console.log(`Recebido userId: ${userId}, codigoAcesso: ${codigoAcesso}`);
    
        // Verificação de campos obrigatórios
        if (userId === undefined || codigoAcesso === undefined) {
            return res.status(400).json({ error: 'userId e codigoAcesso são obrigatórios.' });
        }
    
        // Verifica se userId é um número
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'userId deve ser um número.' });
        }

        try {
            // Chama o controller para validar o código de acesso
            const accessCode = await UserController.validateAccessCode(Number(userId), codigoAcesso);
            return res.json({ message: "Código de acesso válido.", accessCode });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: e.message || 'Erro ao validar o código de acesso.' });
        }
    }

    async tokenValidate(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token não fornecido" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Token não fornecido" });
        }

        try {
            const decoded = jwt.verify(token, 'MeuSegredo123!'); // Verifique o token
            const user = await UserController.findUser(decoded.id); // Encontre o usuário com base no ID do token
            if (user) {
                return res.status(200).json({ message: "Token válido", user });
            } else {
                return res.status(401).json({ message: "Token inválido" });
            }
        } catch (error) {
            return res.status(401).json({ message: "Token inválido", error: error.message });
        }
    }

    async findUser(req, res) {
        try {
            const users = await UserController.findAll();
            res.send({ users });
        } catch (e) {
            console.log(e);
            res.status(400).send('Erro ao buscar usuários.');
        }
    }

    async createUser(req, res) {
        const { name, email, password } = req.body;

        try {
            const user = await UserController.createUser(name, email, password);
            return res.status(201).send(user);
        } catch (e) {
            console.log(e);
            res.status(400).send(e.message || 'Erro ao criar usuário.'); // Envia a mensagem de erro
        }
    }

    async updateUser(req, res) {
        const { id } = req.params;
        const { name, email, password } = req.body;

        try {
            const user = await UserController.update(Number(id), name, email, password);
            return res.status(200).send(user);
        } catch (e) {
            console.log(e);
            res.status(400).send(e.message || 'Erro ao atualizar usuário.'); // Envia a mensagem de erro
        }
    }

    async deleteUser(req, res) {
        const { id } = req.params;

        try {
            await UserController.delete(Number(id));
            return res.status(204).send(); // No Content
        } catch (e) {
            console.log(e);
            res.status(400).send(e.message || 'Erro ao deletar usuário.'); // Envia a mensagem de erro
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        try {
            const { token, userLogged } = await UserController.login(email, password);
            
            // Gerar um código de acesso
            const codigoAcesso = Math.floor(100000 + Math.random() * 900000).toString();
    
            // Enviar o código de acesso por e-mail
            await UserController.sendAccessCode(email, codigoAcesso);
    
            // Armazenar o código de acesso no banco de dados
            await UserController.storeAccessCode(userLogged.id, codigoAcesso);
    
            // Enviar a resposta com o token e o id do usuário
            res.send({ token, userId: userLogged.id }); // Enviando o ID do usuário
        } catch (e) {
            console.log(e);
            res.status(400).send(e.message || 'Erro ao realizar login.'); // Envia a mensagem de erro
        }
    }
    
    
}

module.exports = new UserApi();
