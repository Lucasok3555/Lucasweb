<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerador de RSS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background-color: #f3f4f6;
            font-family: 'Inter', sans-serif;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">

    <div class="max-w-2xl w-full glass-card p-8">
        <header class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Gerador de RSS</h1>
            <p class="text-gray-600">Adicione links e exporte-os como um arquivo de feed RSS (.xml)</p>
        </header>

        <!-- Formulário de Entrada -->
        <div class="space-y-4 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Título do Link</label>
                    <input type="text" id="linkTitle" placeholder="Ex: Meu Artigo" 
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">URL (Link)</label>
                    <input type="url" id="linkUrl" placeholder="https://exemplo.com" 
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                </div>
            </div>
            <button onclick="addLink()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition transform active:scale-95">
                + Adicionar à Lista
            </button>
        </div>

        <!-- Lista de Links -->
        <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-700 mb-4 flex justify-between">
                Itens na Fila 
                <span id="itemCount" class="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">0</span>
            </h2>
            <ul id="linkList" class="space-y-2 max-h-60 overflow-y-auto pr-2">
                <!-- Itens injetados via JS -->
                <li id="emptyState" class="text-center text-gray-400 py-4 border-2 border-dashed border-gray-200 rounded-lg">
                    Nenhum link adicionado ainda.
                </li>
            </ul>
        </div>

        <!-- Botão de Download -->
        <div class="pt-4 border-t border-gray-100">
            <button id="downloadBtn" onclick="generateRSS()" disabled
                class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                Download Arquivo RSS
            </button>
        </div>
    </div>

    <script>
        let links = [];

        const titleInput = document.getElementById('linkTitle');
        const urlInput = document.getElementById('linkUrl');
        const linkListElement = document.getElementById('linkList');
        const downloadBtn = document.getElementById('downloadBtn');
        const itemCount = document.getElementById('itemCount');
        const emptyState = document.getElementById('emptyState');

        function updateUI() {
            // Limpa a lista visual
            linkListElement.innerHTML = '';
            
            if (links.length === 0) {
                linkListElement.appendChild(emptyState);
                downloadBtn.disabled = true;
            } else {
                downloadBtn.disabled = false;
                links.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.className = "flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-2";
                    li.innerHTML = `
                        <div class="overflow-hidden mr-2">
                            <p class="font-medium text-gray-800 truncate">${item.title}</p>
                            <p class="text-xs text-gray-500 truncate">${item.url}</p>
                        </div>
                        <button onclick="removeLink(${index})" class="text-red-500 hover:text-red-700 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    `;
                    linkListElement.appendChild(li);
                });
            }
            itemCount.innerText = links.length;
        }

        function addLink() {
            const title = titleInput.value.trim();
            const url = urlInput.value.trim();

            if (!title || !url) {
                alert("Por favor, preencha o título e a URL.");
                return;
            }

            // Validação básica de URL
            try {
                new URL(url);
            } catch (e) {
                alert("Por favor, insira uma URL válida (começando com http:// ou https://)");
                return;
            }

            links.push({ title, url, date: new Date().toUTCString() });
            
            // Limpa campos
            titleInput.value = '';
            urlInput.value = '';
            titleInput.focus();

            updateUI();
        }

        function removeLink(index) {
            links.splice(index, 1);
            updateUI();
        }

        function generateRSS() {
            if (links.length === 0) return;

            // Estrutura básica do RSS XML
            let rssContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
    <title>Meu Feed Personalizado</title>
    <link>${window.location.href}</link>
    <description>Feed gerado através da aplicação web.</description>
    <language>pt-br</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

            links.forEach(item => {
                rssContent += `
    <item>
        <title>${escapeXml(item.title)}</title>
        <link>${escapeXml(item.url)}</link>
        <pubDate>${item.date}</pubDate>
        <guid>${escapeXml(item.url)}</guid>
    </item>`;
            });

            rssContent += `
</channel>
</rss>`;

            // Criar o Blob e disparar download
            const blob = new Blob([rssContent], { type: 'application/rss+xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'feed.rss';
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }

        function escapeXml(unsafe) {
            return unsafe.replace(/[<>&"']/g, function (m) {
                switch (m) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '"': return '&quot;';
                    case "'": return '&apos;';
                    default: return m;
                }
            });
        }
    </script>
</body>
</html>