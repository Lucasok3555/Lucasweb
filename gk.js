// Dados fictícios para simular resultados de busca
const data = [
    { title: "Como aprender HTML", description: "Um guia completo para iniciantes em HTML." },
    { title: "Introdução ao CSS", description: "Aprenda a estilizar suas páginas web com CSS." },
    { title: "JavaScript para Iniciantes", description: "Comece a programar com JavaScript hoje mesmo!" },
    { title: "O que é Python?", description: "Uma introdução à linguagem de programação Python." },
    { title: "Desenvolvimento Web Full Stack", description: "Aprenda a construir aplicações web completas." }
];

// Função para exibir resultados na página
function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        return;
    }

    results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        `;
        resultsContainer.appendChild(resultItem);
    });
}

// Função para filtrar dados com base na consulta
function search(query) {
    const lowerCaseQuery = query.toLowerCase();
    return data.filter(item => 
        item.title.toLowerCase().includes(lowerCaseQuery) || 
        item.description.toLowerCase().includes(lowerCaseQuery)
    );
}

// Evento de envio do formulário
document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o recarregamento da página
    const query = document.getElementById('searchInput').value.trim();
    const results = search(query);
    displayResults(results);
});
