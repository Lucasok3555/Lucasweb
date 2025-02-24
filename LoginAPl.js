const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

// Banco de Dados Simulado
let users = [];

// Rota de Registro
app.post('/api/register', (req, res) => {
  const { name, birthdate, password } = req.body;
  if (users.find((user) => user.name === name)) {
    return res.status(400).json({ error: 'Usuário já existe.' });
  }

  const key = generateKey();
  users.push({ name, birthdate, password, key });
  res.status(201).json({ message: 'Usuário registrado com sucesso.', key });
});

// Rota de Login
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  const user = users.find((u) => u.name === name && u.password === password);
  if (user) {
    res.json({ user, key: user.key });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas.' });
  }
});

// Rota para Alterar Senha
app.post('/api/change-password', (req, res) => {
  const { name, newPassword } = req.body;
  const user = users.find((u) => u.name === name);
  if (user) {
    user.password = newPassword;
    res.json({ message: 'Senha alterada com sucesso.' });
  } else {
    res.status(404).json({ error: 'Usuário não encontrado.' });
  }
});

// Função para Gerar Chave Aleatória
function generateKey() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Iniciar o Servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
