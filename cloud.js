// Função para salvar dados no localStorage
function saveDataToLocalStorage(data) {
  for (const key in data) {
    localStorage.setItem(key, JSON.stringify(data[key]));
  }
}

// Função para carregar dados do localStorage
function loadDataFromLocalStorage() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = JSON.parse(localStorage.getItem(key));
  }
  return data;
}

// Função para exportar dados como arquivo JSON
function exportDataToFile(data) {
  const jsonString = JSON.stringify(data, null, 2); // Formata JSON com 2 espaços
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "backup-dados.json";
  a.click();

  URL.revokeObjectURL(url); // Libera memória
}

// Função para importar dados de um arquivo JSON
function importDataFromFile(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      callback(data);
    } catch (error) {
      alert("Erro ao importar arquivo JSON: " + error.message);
    }
  };
  reader.readAsText(file);
}

// Atualiza o textarea com os dados atuais
function updateDataDisplay() {
  const data = loadDataFromLocalStorage();
  document.getElementById("dataDisplay").value = JSON.stringify(data, null, 2);
}

// Evento para salvar dados fictícios
document.getElementById("saveData").addEventListener("click", () => {
  const sampleData = {
    nome: "João",
    email: "joao@example.com",
    ultimoAcesso: new Date().toISOString(),
  };
  saveDataToLocalStorage(sampleData);
  updateDataDisplay();
  alert("Dados salvos no localStorage!");
});

// Evento para exportar dados
document.getElementById("exportData").addEventListener("click", () => {
  const data = loadDataFromLocalStorage();
  if (Object.keys(data).length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }
  exportDataToFile(data);
});

// Evento para importar dados
document.getElementById("importData").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      importDataFromFile(file, (data) => {
        saveDataToLocalStorage(data);
        updateDataDisplay();
        alert("Dados importados com sucesso!");
      });
    }
  };
  input.click();
});

// Evento para limpar dados
document.getElementById("clearData").addEventListener("click", () => {
  localStorage.clear();
  updateDataDisplay();
  alert("Todos os dados foram apagados!");
});

// Atualiza a visualização inicial
updateDataDisplay();
