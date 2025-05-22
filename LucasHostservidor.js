const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'sites.json');

// Garante que a pasta data exista
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '{}');
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rota para salvar site
app.post('/api/site/:id', (req, res) => {
  const id = req.params.id;
  const { nome, conteudo } = req.body;

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data[id] = { nome, conteudo, updatedAt: new Date().toISOString() };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Rota para carregar site
app.get('/api/site', (req, res) => {
  const id = req.query.id;
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  if (data[id]) {
    res.json(data[id]);
  } else {
    res.status(404).json({ error: "Site não encontrado." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
