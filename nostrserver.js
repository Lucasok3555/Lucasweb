const WebSocket = require('ws');

// Criando um servidor WebSocket
const wss = new WebSocket.Server({ port: 8080 });

console.log("Servidor Nostr rodando na porta 8080...");

// Função para verificar se a mensagem recebida é válida (JSON)
function isValidJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// Evento quando um cliente se conecta
wss.on('connection', (ws) => {
    console.log("Novo cliente conectado");

    // Evento quando uma mensagem é recebida
    ws.on('message', (message) => {
        console.log(`Mensagem recebida: ${message}`);

        if (!isValidJson(message)) {
            console.log("Mensagem inválida");
            return;
        }

        const msg = JSON.parse(message);

        // Verificar se a mensagem segue o formato Nostr
        if (Array.isArray(msg) && msg.length >= 2) {
            const [type, data] = msg;

            // Aqui você pode processar diferentes tipos de mensagens Nostr
            switch (type) {
                case "EVENT":
                    console.log("Evento recebido:", data);
                    // Reenviar o evento para todos os clientes conectados
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(["EVENT", data]));
                        }
                    });
                    break;

                case "REQ":
                    console.log("Requisição recebida:", data);
                    // Aqui você pode implementar a lógica para lidar com requisições de eventos
                    break;

                case "CLOSE":
                    console.log("Conexão fechada pelo cliente");
                    break;

                default:
                    console.log("Tipo de mensagem desconhecido:", type);
            }
        } else {
            console.log("Formato de mensagem inválido");
        }
    });

    // Evento quando a conexão é fechada
    ws.on('close', () => {
        console.log("Cliente desconectado");
    });
});
