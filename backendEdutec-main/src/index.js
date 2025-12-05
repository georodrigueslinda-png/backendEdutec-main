import express from "express"
import cors from "cors"
import mysql from "mysql2"
import dotenv from "dotenv"

// carregar variáveis do .env
dotenv.config()

const { DATABASE_HOST, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD } = process.env

const app = express()
const port = 3333

app.use(cors())
app.use(express.json())

// Criar conexão com o banco
const database = mysql.createPool({
    host: benserverplex.ddns.net,
    database: agrotech_quis,
    user: alunos,
    password: senhaAluno,
    connectionLimit: 10
})


// ======================= ROTAS =======================

// Listar usuários
app.get("/", (request, response) => {
    const selectCommand = "SELECT name, email FROM criarUsuario"

    database.query(selectCommand, (error, users) => {
        if (error) {
            console.log(error)
            return response.status(500).json({ message: "Erro ao buscar usuários" })
        }

        response.json(users)
    })
})


// Cadastro de usuário
app.post("/cadastrar", (request, response) => {
    const { name, email, password } = request.body.user

    const insertCommand = `
        INSERT INTO criarUsuario(name, email, password)
        VALUES(?, ?, ?)
    `

    database.query(insertCommand, [name, email, password], (error) => {
        if (error) {
            console.log(error)
            return response.status(500).json({ message: "Erro ao cadastrar usuário" })
        }

        response.status(201).json({ message: "Usuário cadastrado com sucesso!" })
    })
})


// Login
app.post("/login", (request, response) => {
    const { email, password } = request.body.user

    const selectCommand = "SELECT * FROM criarUsuario WHERE email = ?"

    database.query(selectCommand, [email], (error, result) => {
        if (error) {
            console.log(error)
            return response.status(500).json({ message: "Erro ao fazer login" })
        }

        if (result.length === 0 || password !== result[0].password) {
            return response.json({ message: "Email ou senha incorreto!" })
        }

        response.json({
            id: result[0].id,
            name: result[0].name,
            pontuacao: result[0].pontuacao
        })
    })
})


// ======================= JOGO: PONTUAÇÃO E RANKING =======================

// Salvar pontuação do usuário
// Front envia: { usuarioId, pontuacao }
app.post("/pontuacao", (request, response) => {
    const { usuarioId, pontuacao } = request.body

    if (!usuarioId || pontuacao === undefined) {
        return response.status(400).json({ message: "usuarioId e pontuacao são obrigatórios" })
    }

    const updateCommand = `
        UPDATE criarUsuario
        SET pontuacao = ?
        WHERE id = ?
    `

    database.query(updateCommand, [pontuacao, usuarioId], (error) => {
        if (error) {
            console.log(error)
            return response.status(500).json({ message: "Erro ao salvar pontuação" })
        }

        response.json({ message: "Pontuação salva com sucesso!" })
    })
})


// Ranking (top 10)
app.get("/ranking", (request, response) => {
    const selectCommand = `
        SELECT id, name AS nome, pontuacao
        FROM criarUsuario
        ORDER BY pontuacao DESC
        LIMIT 10
    `

    database.query(selectCommand, (error, ranking) => {
        if (error) {
            console.log(error)
            return response.status(500).json({ message: "Erro ao carregar ranking" })
        }

        response.json(ranking)
    })
})


// ======================= INICIAR SERVIDOR =======================

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})
