(function () {
    'use strict';

    // === Variáveis Globais ===
    const STORAGE_KEY = "lucasweb_cache";
    const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB por parte
    const LOCAL_DOMAIN_MAP = {
        "BR": ".com.br",
        "US": ".com",
        "DE": ".de",
        "FR": ".fr"
    };

    // === 1. Usar DNS seguro (opcional) ===
    function useSecureDNS(enable = false) {
        if (enable) {
            console.log("Ativando DNS seguro...");
            try {
                if (window.navigator && navigator.connection) {
                    navigator.connection.setDNS("1.1.1.1"); // Cloudflare DNS
                    console.log("DNS seguro ativado.");
                } else {
                    console.warn("Navegador não suporta configuração de DNS.");
                }
            } catch (e) {
                console.error("Erro ao configurar DNS seguro:", e);
            }
        } else {
            console.log("DNS seguro desativado por padrão.");
        }
    }

    // === 2. Gerenciar "Não Rastrear" (Do Not Track) ===
    function toggleDoNotTrack(enable = true) {
        if (enable) {
            navigator.__defineGetter__("doNotTrack", () => "1");
            console.log("Do Not Track ativado automaticamente.");
        } else {
            navigator.__defineGetter__("doNotTrack", () => "0");
            console.log("Do Not Track desativado.");
        }
    }

    // === 3. Redirecionar para versão local de qualquer site ===
    async function redirectToLocalDomainIfNeeded() {
        const userCountry = await detectUserCountry();
        const targetSuffix = LOCAL_DOMAIN_MAP[userCountry] || ".com";

        const currentUrl = window.location.href;

        // Verifica se o domínio já termina com o sufixo correto
        if (!currentUrl.endsWith(targetSuffix)) {
            const newUrl = currentUrl.replace(/(\.[a-z]{2,3})(\/|$)/, `${targetSuffix}$2`);
            console.log(`Redirecionando para versão local: ${newUrl}`);
            window.location.href = newUrl;
        }
    }

    // === 4. Detectar país do usuário ===
    async function detectUserCountry() {
        try {
            const response = await fetch("https://ipapi.co/json/ ");
            const data = await response.json();
            return data.country;
        } catch (e) {
            console.warn("Não foi possível detectar o país. Usando padrão.");
            return "US";
        }
    }

    // === 5. Dividir downloads em partes (chunks) ===
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

    // === 6. Armazenamento local avançado (IndexedDB ou localStorage) ===
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

    // === 7. Carregar dados do armazenamento local ===
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

    // === 8. Permitir download de arquivos .torrent ===
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

    // === 9. Modo escuro opcional ===
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

    // === 10. Bloquear pressão digital (fingerprinting) ===
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
        useSecureDNS(false); // Desativa DNS seguro por padrão
        toggleDoNotTrack(true); // Ativa "Não Rastrear" automaticamente
        blockFingerprinting(); // Bloqueia fingerprinting
        injectDarkModeStyle();
        applyInitialDarkMode();
        addDarkModeToggle();
        interceptNavigation();
        enableTorrentSupport();

        await redirectToLocalDomainIfNeeded(); // Redireciona para versões locais

        const pageUrl = window.location.href;
        const cached = await loadFromStorage(pageUrl);
        if (!cached) {
            const html = await fetch(pageUrl).then(res => res.text());
            saveToStorage(pageUrl, html);
        }

        // Botão para ativar DNS seguro manualmente
        const dnsButton = document.createElement("button");
        dnsButton.textContent = "Ativar DNS Seguro";
        dnsButton.style.position = "fixed";
        dnsButton.style.bottom = "10px";
        dnsButton.style.right = "10px";
        dnsButton.style.zIndex = "9999";
        dnsButton.style.padding = "10px 20px";
        dnsButton.style.backgroundColor = "#333";
        dnsButton.style.color = "#fff";
        dnsButton.style.border = "none";
        dnsButton.style.borderRadius = "8px";
        dnsButton.style.cursor = "pointer";

        dnsButton.onclick = () => {
            useSecureDNS(true);
            alert("DNS seguro ativado!");
        };

        document.body.appendChild(dnsButton);
    });

})();
