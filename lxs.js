document.getElementById('convert-btn').addEventListener('click', () => {
  const fileInput = document.getElementById('file-input');
  if (!fileInput.files.length) {
    alert('Por favor, selecione um arquivo.');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  // Gerar ID único para o arquivo
  function generateFileId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  reader.onload = (e) => {
    const fileId = generateFileId();
    const now = new Date();

    let fileType, fileData, fileName;

    if (file.type.startsWith('video/')) {
      // Tratar como vídeo (.lxsv)
      fileType = 'Vídeo';
      fileName = `video_${fileId}.lxsv`;
      fileData = {
        video: e.target.result,
        metadata: {
          datetime: now.toISOString(),
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          fileId: fileId,
        },
      };
    } else if (file.type.startsWith('image/')) {
      // Tratar como imagem (.lxs)
      fileType = 'Imagem';
      fileName = `foto_${fileId}.lxs`;
      fileData = {
        image: e.target.result,
        metadata: {
          datetime: now.toISOString(),
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          fileId: fileId,
        },
      };
    } else {
      alert('Formato de arquivo não suportado.');
      return;
    }

    // Exibir resultado
    document.getElementById('file-type').textContent = fileType;
    document.getElementById('file-id').textContent = fileId;
    document.getElementById('datetime').textContent = now.toLocaleString();

    const blob = new Blob([JSON.stringify(fileData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.getElementById('download-link');
    downloadLink.href = url;
    downloadLink.download = fileName;

    // Mostrar seção de resultado
    document.querySelector('.result-section').style.display = 'block';
  };

  // Ler o arquivo como base64
  reader.readAsDataURL(file);
});
