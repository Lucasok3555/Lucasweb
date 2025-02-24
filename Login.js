// Variáveis globais
let currentUser = null;

// Alternar entre telas
document.getElementById('register-link').addEventListener('click', () => {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.remove('hidden');
});

document.getElementById('login-link').addEventListener('click', () => {
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
});

// Função de Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('login-name').value;
  const password = document.getElementById('login-password').value;

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });

  if (response.ok) {
    const data = await response.json();
    currentUser = data.user;
    showAccountPanel(data.user, data.key);
  } else {
    alert('Login falhou. Verifique suas credenciais.');
  }
});

// Função de Registro
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const birthdate = document.getElementById('register-birthdate').value;
  const password = document.getElementById('register-password').value;

  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, birthdate, password }),
  });

  if (response.ok) {
    alert('Registro concluído! Faça login com sua nova conta.');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
  } else {
    alert('Erro ao registrar. Tente novamente.');
  }
});

// Mostrar Painel da Conta
function showAccountPanel(user, key) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('account-panel').classList.remove('hidden');
  document.getElementById('user-info').textContent = `Olá, ${user.name}!`;
  document.getElementById('access-key').textContent = key;
}

// Alterar Senha
document.getElementById('change-password-btn').addEventListener('click', async () => {
  const newPassword = prompt('Digite sua nova senha:');
  if (!newPassword) return;

  const response = await fetch('/api/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: currentUser.name, newPassword }),
  });

  if (response.ok) {
    alert('Senha alterada com sucesso!');
  } else {
    alert('Erro ao alterar a senha.');
  }
});

// Sair
document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('account-panel').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
});
