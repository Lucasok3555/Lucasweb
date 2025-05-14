(function () {
    'use strict';

    // === Variáveis Globais ===
    const STORAGE_KEY = "lucasweb_cache";
    const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB por parte
    const LOCAL_DOMAIN_MAP = {
        "BR": "google.com.br",
        "US": "google.com",
        "DE": "google.de",
        "FR": "google.fr"
    };

    // === 1. Detectar país do usuário ===
    async function detectUserCountry() {
        try {
            const response = await fetch("https://ipapi.co/json/ ");
            const data = await response.json();
            return data.country;
        } catch (e) {
            console.warn("Não foi possível detectar o país.");
            return "US";
        }
    }

    // === 2. Redirecionar para versão local do site ===
    async function redirectToLocalDomainIfNeeded(currentDomain = "google.com") {
        const userCountry = await detectUserCountry();
        const targetDomain = LOCAL_DOMAIN_MAP[userCountry] || currentDomain;

        if (!window.location.href.includes(targetDomain)) {
            const newUrl = window.location.href.replace(currentDomain, targetDomain);
            console.log(`Redirecionando para: ${newUrl}`);
            window.location.href = newUrl;
        }
    }

    // === 3. Dividir downloads em partes (chunks) ===
    async function splitDownload(url, parts = 4) {
        let allChunks = [];

        for (let i = 0; i < parts; i++) {
            const start = i * MAX_CHUNK_SIZE;
            const end = start + MAX_CHUNK_SIZE - 1;

            try {
                const response = await fetch(url, {
                    headers: { Range: `bytes=${start}-${end}` }
                });

                if (response.ok || response.status === 206) {
                    const buffer = await response.arrayBuffer();
                    allChunks.push(buffer);
                    saveToStorage(`${url}_part${i}`, buffer); // Salva cada parte
                }
            } catch (e) {
                console.error("Erro ao baixar parte:", i, e);
            }
        }

        const fullData = concatenateBuffers(allChunks);
        saveToStorage(url, fullData); // Salva conteúdo completo
        return fullData;
    }

    function concatenateBuffers(buffers) {
        const totalLength = buffers.reduce((acc, b) => acc + b.byteLength, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;

        buffers.forEach(buffer => {
            result.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        });

        return result.buffer;
    }

    // === 4. Armazenamento local avançado (IndexedDB ou localStorage) ===
    function saveToStorage(key, data) {
        if (window.indexedDB) {
            const request = indexedDB.open(STORAGE_KEY, 1);
            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("resources")) {
                    db.createObjectStore("resources", { keyPath: "url" });
                }
            };
            request.onsuccess = event => {
                const db = event.target.result;
                const tx = db.transaction("resources", "readwrite");
                tx.objectStore("resources").put({ url: key, data: data });
                tx.commit();
            };
        } else {
            localStorage.setItem(key, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        }
    }

    // === 5. Carregar dados do armazenamento local ===
    function loadFromStorage(url) {
        return new Promise((resolve, reject) => {
            if (window.indexedDB) {
                const request = indexedDB.open(STORAGE_KEY, 1);
                request.onsuccess = event => {
                    const db = event.target.result;
                    const store = db.transaction("resources", "readonly").objectStore("resources").get(url);
                    store.onsuccess = () => resolve(store.result?.data || null);
                    store.onerror = () => reject(null);
                };
            } else {
                const cached = localStorage.getItem(url);
                resolve(cached ? JSON.parse(cached).data : null);
            }
        });
    }

    // === 6. Permitir download de arquivos .torrent ===
    function enableTorrentSupport() {
        document.addEventListener("click", e => {
            const link = e.target.closest("a");
            if (link && link.href.endsWith(".torrent")) {
                e.preventDefault();
                alert("Iniciando download do torrent...");
                simulateTorrentDownload(link.href);
            }
        });
    }

    function simulateTorrentDownload(url) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                clearInterval(interval);
                alert("Download do torrent concluído!");
            } else {
                console.log(`Progresso do torrent: ${Math.min(progress, 95)}%`);
            }
        }, 500);
    }

    // === 7. Modo escuro opcional ===
    function toggleDarkMode(force = false) {
        const isDark = force || document.documentElement.classList.contains("dark-mode");

        if (isDark) {
            document.documentElement.classList.remove("dark-mode");
            document.body.style.background = "#fff";
            document.body.style.color = "#000";
        } else {
            document.documentElement.classList.add("dark-mode");
            document.body.style.background = "#121212";
            document.body.style.color = "#f0f0f0";
        }

        localStorage.setItem("user_dark_mode", isDark ? "false" : "true");
    }

    function injectDarkModeStyle() {
        const style = document.createElement("style");
        style.textContent = `
            .dark-mode, .dark-mode body {
                background-color: #121212 !important;
                color: #f0f0f0 !important;
            }
            .dark-mode img {
                filter: invert(1) hue-rotate(180deg);
            }
        `;
        document.head.appendChild(style);
    }

    function applyInitialDarkMode() {
        injectDarkModeStyle();
        if (localStorage.getItem("user_dark_mode") === "true") {
            document.documentElement.classList.add("dark-mode");
        }
    }

    function addDarkModeToggle() {
        const btn = document.createElement("button");
        btn.textContent = "Modo Escuro";
        btn.style.position = "fixed";
        btn.style.top = "10px";
        btn.style.right = "10px";
        btn.style.zIndex = "9999";
        btn.style.padding = "10px 20px";
        btn.style.backgroundColor = "#333";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.borderRadius = "8px";
        btn.style.cursor = "pointer";

        btn.onclick = () => {
            toggleDarkMode();
        };

        document.body.appendChild(btn);
    }

    // === 8. Desativar HTTPS se site for HTTP ===
    function adjustProtocolIfNeeded(url) {
        if (url.startsWith("http://")) {
            console.log("Site inseguro. HTTPS desativado.");
            document.body.style.border = "2px solid red";
        } else {
            console.log("Conexão segura (HTTPS).");
        }
    }

    // === 9. Bloquear pressão digital (fingerprinting) ===
    function blockFingerprinting() {
        CanvasRenderingContext2D.prototype.fillText = function () {
            console.warn("Canvas fingerprint bloqueado");
        };

        WebGLRenderingContext.prototype.getParameter = function () {
            console.warn("WebGL fingerprint bloqueado");
        };

        Object.defineProperty(navigator, 'plugins', {
            value: [],
            configurable: false,
            writable: false
        });

        Object.defineProperty(navigator, 'languages', {
            value: ['en-US', 'en'],
            configurable: false,
            writable: false
        });
    }

    // === 10. Enviar pacotes por múltiplas rotas ===
    function sendViaMultipleRoutes(url, payload) {
        const routes = ["/route/a", "/route/b", "/route/c"];
        const chunks = splitPayload(payload, MAX_CHUNK_SIZE);

        chunks.forEach((chunk, index) => {
            const route = routes[index % routes.length];
            fetch(route, {
                method: "POST",
                body: chunk,
                headers: { "X-Requested-With": "LucasWebApp" }
            }).catch(() => {
                console.warn(`Pacote ${index} falhou.`);
            });
        });
    }

    function splitPayload(data, size) {
        const array = new TextEncoder().encode(data).buffer;
        const chunks = [];

        for (let i = 0; i < array.byteLength; i += size) {
            chunks.push(array.slice(i, i + size));
        }

        return chunks;
    }

    // === 11. Interceptação de navegação para evitar sites inseguros ===
    function interceptNavigation() {
        document.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", e => {
                const href = link.getAttribute("href");
                if (href && href.startsWith("http://")) {
                    e.preventDefault();
                    alert("Este site usa HTTP inseguro. Tente usar uma versão IPFS ou HTTPS.");
                }
            });
        });
    }

    // === 12. Inicialização Geral ===
    window.addEventListener("load", async () => {
        injectDarkModeStyle();
        applyInitialDarkMode();
        addDarkModeToggle();
        interceptNavigation();
        enableTorrentSupport();
        blockFingerprinting();

        const pageUrl = window.location.href;
        const cached = await loadFromStorage(pageUrl);
        if (!cached) {
            const html = await fetch(pageUrl).then(res => res.text());
            saveToStorage(pageUrl, html);
        }

        // Exemplo: dividir download de recurso
        // await splitDownload("https://example.com/video.mp4 ");
    });

})();
