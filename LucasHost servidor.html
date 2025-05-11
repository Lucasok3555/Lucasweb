const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'sites.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Carrega os sites salvos
function readSites() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '{}');
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

// Salva os sites
function writeSites(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Rota para obter todos os sites
app.get('/api/sites', (req, res) => {
  const sites = readSites();
  res.json(sites);
});

// Rota para obter um site específico
app.get('/api/site/:id', (req, res) => {
  const sites = readSites();
  const site = sites[req.params.id];
  if (site) {
    res.json(site);
  } else {
    res.status(404).json({ error: "Site não encontrado" });
  }
});

// Rota para salvar ou atualizar um site
app.post('/api/site/:id', (req, res) => {
  const id = req.params.id;
  const { nome, conteudo } = req.body;

  const sites = readSites();
  sites[id] = { nome, conteudo };
  writeSites(sites);

  res.json({ success: true });
});

console.log(`Servidor rodando em http://localhost:${PORT}`);
app.listen(PORT);
