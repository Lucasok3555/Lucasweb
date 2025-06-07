const WebSocket = require('ws');

// Cria o servidor WebSocket na porta 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log('Servidor WebSocket rodando na porta 8080');

wss.on('connection', (ws) => {
  console.log('Cliente conectado.');

  // Mensagem recebida do cliente
  ws.on('message', (message) => {
    console.log(`Mensagem recebida: ${message}`);

    // Envia a mensagem para todos os clientes conectados
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Cliente desconectado
  ws.on('close', () => {
    console.log('Cliente desconectado.');
  });
});
