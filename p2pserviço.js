const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Armazenamento temporário para ofertas/respostas
const users = {};

io.on('connection', (socket) => {
    console.log('Novo usuário conectado:', socket.id);

    // Recebe a oferta do remetente
    socket.on('offer', (data) => {
        const { senderKey, offer } = data;
        users[senderKey] = { socketId: socket.id, offer };
        console.log(`Oferta recebida de ${senderKey}`);
    });

    // Recebe a resposta do destinatário
    socket.on('answer', (data) => {
        const { recipientKey, answer } = data;
        if (users[recipientKey]) {
            io.to(users[recipientKey].socketId).emit('answer', { answer });
            console.log(`Resposta enviada para ${recipientKey}`);
        }
    });

    // Encaminha candidatos ICE
    socket.on('ice-candidate', (data) => {
        const { targetKey, candidate } = data;
        if (users[targetKey]) {
            io.to(users[targetKey].socketId).emit('ice-candidate', { candidate });
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
