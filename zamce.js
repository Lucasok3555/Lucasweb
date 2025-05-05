(function () {
    'use strict';

    // 1. Forçar modo escuro
    function enableDarkMode() {
        const style = document.createElement('style');
        style.textContent = `
            html, body {
                filter: invert(1) hue-rotate(180deg);
                background-color: #121212 !important;
                color: #f0f0f0 !important;
            }
            img {
                filter: invert(1) hue-rotate(180deg);
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Redirecionar busca para DuckDuckGo
    function forceDuckDuckGoSearch() {
        const forms = document.querySelectorAll("form");
        forms.forEach(form => {
            form.addEventListener("submit", function (e) {
                const input = form.querySelector("input[type='text'], input[name='q']");
                if (input) {
                    e.preventDefault();
                    const query = encodeURIComponent(input.value);
                    window.location.href = `https://duckduckgo.com/?q=${query}`;
                }
            });
        });
    }

    // 3. Esconder o IP do usuário (usando proxy ou anonimizador)
    function hideUserIP() {
        console.log("Tentando ocultar o IP do usuário...");
        // Simulação — em produção, usaria um serviço de proxy anônimo
        fetch("https://api.ipify.org?format=json")
            .then(res => res.json())
            .then(data => {
                console.warn("Seu IP real é:", data.ip);
                console.info("Use um proxy ou VPN integrado para ocultar.");
            });
    }

    // 4. Detectar rede fraca e mudar para outra conexão (Wi-Fi → Dados móveis)
    function checkNetworkStrengthAndSwitch() {
        if ('connection' in navigator && 'effectiveType' in navigator.connection) {
            const connection = navigator.connection.effectiveType;
            console.log("Tipo de conexão atual:", connection);

            if (connection === "2g" || connection === "slow-2g") {
                console.warn("Conexão muito lenta detectada!");
                alert("Rede fraca detectada. Mude para dados móveis.");
                // Aqui você pode chamar código nativo (Java/Kotlin) para alternar a rede
            }
        } else {
            console.warn("API de rede não disponível neste dispositivo.");
        }
    }

    // 5. Salvar todo o site no cache ("caixa")
    function saveEntireSiteToCache() {
        const allResources = [];

        // Intercepta requisições e armazena no cache
        const oldFetch = window.fetch;
        window.fetch = function (...args) {
            return oldFetch(...args).then(response => {
                const url = args[0];
                response.clone().text().then(text => {
                    localStorage.setItem(url, text);
                    allResources.push(url);
                });
                return response;
            });
        };

        window.addEventListener("beforeunload", () => {
            localStorage.setItem("cached_resources", JSON.stringify(allResources));
        });
    }

    // 6. Acessar páginas offline (fallback para google.com)
    function loadOfflineFallback(site = "https://www.google.com") {
        const cached = localStorage.getItem(site);
        if (cached) {
            document.open();
            document.write(cached);
            document.close();
        } else {
            console.warn("Nenhuma versão offline encontrada para:", site);
        }
    }

    // 7. Agilidade máxima nos downloads (divisão paralela)
    async function downloadWithMaxSpeed(url, parts = 4) {
        const response = await fetch(url, { method: "HEAD" });
        const contentLength = parseInt(response.headers.get("Content-Length"));
        const partSize = Math.ceil(contentLength / parts);

        let buffers = [];
        let promises = [];

        for (let i = 0; i < parts; i++) {
            const start = i * partSize;
            const end = Math.min(start + partSize - 1, contentLength - 1);

            promises.push(
                fetch(url, {
                    headers: {
                        Range: `bytes=${start}-${end}`
                    }
                }).then(res => res.arrayBuffer())
            );
        }

        const arrayBuffers = await Promise.all(promises);
        buffers = new Uint8Array(contentLength);
        let offset = 0;

        arrayBuffers.forEach(buffer => {
            buffers.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        });

        const blob = new Blob([buffers.buffer]);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = url.split("/").pop() || "download";
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // Executar todas as funções ao carregar a página
    window.addEventListener("load", () => {
        enableDarkMode();
        forceDuckDuckGoSearch();
        hideUserIP();
        checkNetworkStrengthAndSwitch();
        saveEntireSiteToCache();

        // Carrega Google se estiver offline
        if (!navigator.onLine) {
            loadOfflineFallback("https://www.google.com");
        }
    });

    // Exportando algumas funções para uso externo
    window.darkok = {
        enableDarkMode,
        forceDuckDuckGoSearch,
        hideUserIP,
        checkNetworkStrengthAndSwitch,
        saveEntireSiteToCache,
        loadOfflineFallback,
        downloadWithMaxSpeed
    };

})();
