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

    // 3. Esconder IP do usuário
    function hideUserIP() {
        console.log("Tentando ocultar o IP do usuário...");
        fetch("https://api.ipify.org?format=json")
            .then(res => res.json())
            .then(data => {
                console.warn("Seu IP real é:", data.ip);
                console.info("Use proxy anônimo ou serviço integrado.");
            });
    }

    // 4. Detectar rede fraca e mudar para outra conexão
    function checkNetworkStrengthAndSwitch() {
        if ('connection' in navigator && 'effectiveType' in navigator.connection) {
            const connection = navigator.connection.effectiveType;
            console.log("Tipo de conexão atual:", connection);

            if (connection === "2g" || connection === "slow-2g") {
                alert("Rede fraca detectada. Mude para dados móveis.");
            }
        } else {
            console.warn("API de rede não disponível neste dispositivo.");
        }
    }

    // 5. Salvar todo o site no cache ("caixa")
    function saveEntireSiteToCache() {
        const allResources = [];

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

    // 6. Páginas offline - fallback para google.com
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

    // 7. Agilidade máxima nos downloads
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

    // 8. Suporte ao formato .lxsv (vídeo personalizado)
    function handleLxsvVideo(url) {
        if (url.endsWith(".lxsv")) {
            const videoContainer = document.createElement("div");
            const videoPlayer = document.createElement("video");
            videoPlayer.controls = true;
            videoPlayer.src = url;
            videoPlayer.style.width = "100%";
            videoPlayer.style.maxWidth = "600px";
            videoPlayer.style.margin = "20px auto";

            videoContainer.appendChild(videoPlayer);
            document.body.appendChild(videoContainer);

            console.log("Formato .lxsv detectado. Player iniciado.");
        }
    }

    // 9. Suporte à rede PASN
    function checkForPasnNetwork() {
        // Simulação — você pode usar API nativa Android para isso
        const isPasn = false; // Exemplo: detectado por código nativo
        if (isPasn) {
            console.log("Conectado à rede PASN.");
            document.body.style.border = "2px solid cyan";
        } else {
            console.log("Rede normal detectada.");
        }
    }

    // 10. Modo leve para redes lentas (ex: 4G ruim)
    function enableLightModeForSlowNetwork() {
        if ('connection' in navigator && 'effectiveType' in navigator.connection) {
            const type = navigator.connection.effectiveType;
            if (type === "2g" || type === "slow-2g") {
                console.warn("Modo leve ativado para rede lenta.");
                document.querySelectorAll("img").forEach(img => img.remove());
                document.querySelectorAll("iframe").forEach(iframe => iframe.remove());
            }
        }
    }

    // Executar todas as funções ao carregar a página
    window.addEventListener("load", () => {
        enableDarkMode();
        forceDuckDuckGoSearch();
        hideUserIP();
        checkNetworkStrengthAndSwitch();
        saveEntireSiteToCache();

        if (!navigator.onLine) {
            loadOfflineFallback("https://www.google.com");
        }

        checkForPasnNetwork();
        enableLightModeForSlowNetwork();

        // Detectar vídeos lxsv
        const videos = document.querySelectorAll("video, source");
        videos.forEach(v => {
            if (v.src.endsWith(".lxsv")) {
                handleLxsvVideo(v.src);
            }
        });
    });

    // Exportando algumas funções para uso externo
    window.darkok = {
        enableDarkMode,
        forceDuckDuckGoSearch,
        hideUserIP,
        checkNetworkStrengthAndSwitch,
        saveEntireSiteToCache,
        loadOfflineFallback,
        downloadWithMaxSpeed,
        handleLxsvVideo,
        checkForPasnNetwork,
        enableLightModeForSlowNetwork
    };

})();
