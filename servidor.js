const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Cria o servidor HTTP com Express
const app = express();
const server = http.createServer(app);

// Cria o servidor WebSocket
const wss = new WebSocket.Server({ server });

// Armazena as conexões WebSocket dos clientes
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado');

    // Adiciona o novo cliente ao conjunto de clientes
    clients.add(ws);

    // Quando recebe uma mensagem de um cliente
    ws.on('message', (message) => {
        console.log(`Mensagem recebida: ${message}`);

        // Envia a mensagem para todos os outros clientes conectados
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Quando o cliente se desconecta
    ws.on('close', () => {
        console.log('Cliente desconectado');
        clients.delete(ws);
    });
});

// Rota básica para servir uma página HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Inicia o servidor na porta 3000
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
