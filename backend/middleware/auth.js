const jwt = require('jsonwebtoken')
const user = require('../controller/user')

function authMiddleware(roles = []) {
    return (req, res, next) => {
        const token = req.headers["authorization"]

        if(!token) {
            return res.status(500).json("Usuário não esta logado")
        }

        jwt.verify(token, 'MeuSegredo123!', async (err, decoded) => {
            if(err) {
                return res.status(500).json("Usuário não esta logado")
            }

            const userLogged = await user.findUser(decoded.id)
            if(!userLogged){
                return res.status(500).json("USUÁRIO não encontrado")
            }
            if(roles.length && !roles.includes(userLogged.role)) {
                return res.status(500).json("USUÁRIO SEM, PERMISSÃO")
            }

            req.session = decoded

            next()
        })
    }
}

module.exports = authMiddleware