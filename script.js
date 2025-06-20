function carregarVideo() {
  const url = document.getElementById('urlInput').value.trim();
  const playerDiv = document.getElementById('player');

  // Limpa conteúdo anterior
  playerDiv.innerHTML = '';

  if (url) {
    // Cria elemento de vídeo
    const video = document.createElement('video');
    video.controls = true;

    // Cria fonte do vídeo
    const source = document.createElement('source');
    source.src = url;
    source.type = 'video/mp4'; // Pode ajustar conforme o tipo do vídeo
    
    // Cria fonte do vídeo
    const source = document.createElement('source');
    source.src = url;
    source.type = 'video/mp4'; // Pode ajustar conforme o tipo do vídeo

    video.appendChild(source);
    playerDiv.appendChild(video);
  } else {
    alert("Por favor, insira uma URL válida.");
  }
}
