const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para permitir JSON no corpo das requisições
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Caminho para o arquivo JSON que armazena as postagens
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Rota para obter todas as postagens
app.get('/api/posts', (req, res) => {
  fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler as postagens.' });
    }
    res.json(JSON.parse(data));
  });
});

// Rota para criar uma nova postagem
app.post('/api/posts', (req, res) => {
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler as postagens.' });
    }

    const posts = JSON.parse(data);
    const newPost = { userId, content, likes: 0 };
    posts.push(newPost);

    fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar a postagem.' });
      }
      res.status(201).json(newPost);
    });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
