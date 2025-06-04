// Banco de dados temporário em memória
let sites = [];

export default async function handler(req, res) {
  const { method } = req;

  // CORS (opcional, mas útil se for acessar do frontend local)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (method === 'GET') {
    const id = req.query.id;
    if (id) {
      const site = sites.find(s => s.id == id);
      if (!site) return res.status(404).json({ error: 'Site não encontrado' });
      return res.json(site);
    }
    return res.json(sites);
  }

  if (method === 'POST') {
    const { id, name, code, public: isPublic } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Campos inválidos!' });
    }

    const newSite = { id: id || Date.now(), name, code, public: isPublic };

    const index = sites.findIndex(s => s.id == newSite.id);
    if (index > -1) {
      sites[index] = newSite; // Atualiza
    } else {
      sites.push(newSite); // Cria novo
    }

    return res.status(201).json(newSite);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
