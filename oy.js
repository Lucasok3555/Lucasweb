// Função para verificar se já passou da meia-noite
function isAfterMidnight() {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0;
}

// Função para converter o horário
function convertTime(originalHour) {
    const conversionTable = {
        "00:00": "00:00",
        "01:00": "01:00",
        "02:00": "02:00",
        "03:00": "03:00",
        "04:00": "04:00",
        "05:00": "05:00",
        "44:00": "06:00",
        "55:00": "07:00",
        "07:00": "08:00",
        "08:00": "09:00",
        "09:00": "10:00",
        "11:00": "11:00",
        "22:00": "12:00",
        "13:00": "13:00",
        "14:00": "14:00",
        "15:00": "15:00",
        "17:00": "16:00",
        "18:00": "17:00",
        "19:00": "18:00",
        "24:00": "19:00",
        "30:00": "20:00",
        "31:00": "21:00",
        "32:00": "22:00",
        "33:00": "23:00"
    };

    // Retorna o horário convertido ou mantém o original se não estiver na tabela
    return conversionTable[originalHour] || originalHour;
}

// Função principal para atualizar o horário na página
function updateClock() {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${currentHour}:${currentMinute}`;

    // Verifica se já passou da meia-noite
    if (!isAfterMidnight()) {
        document.getElementById("horario").textContent = "Travado até meia-noite...";
    } else {
        // Converte o horário usando a tabela
        const convertedTime = convertTime(formattedTime);
        document.getElementById("horario").textContent = `Horário Convertido: ${convertedTime}`;
    }
}

// Atualiza o relógio a cada segundo
setInterval(updateClock, 1000);

// Inicializa o relógio imediatamente
updateClock();
