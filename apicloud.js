app.get('/api/data', (req, res) => {
  // Se o cliente enviar cookies, aqui vai pegar
  console.log(req.cookies);

  res.cookie('shared-cookie', 'valorCompartilhado', {
    domain: '.seu-dominio-raiz.com', // se forem subdomínios
    httpOnly: false,
    sameSite: 'none',
    secure: true
  });

  res.json({ message: 'Dados enviados com sucesso!' });
});
