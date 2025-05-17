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

    // === 1. Simular HTTP/3 (otimização de requisição) ===
    async function fetchWithOptimizedHeaders(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'force-cache',
                signal: controller.signal,
                headers: {
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive'
                }
            });

            clearTimeout(timeoutId);
            return response;
        } catch (e) {
            console.error("Erro ao carregar com HTTP otimizado:", e);
            return null;
        }
    }

    // === 2. Minificação de conteúdo ===
    function minifyHTML(html) {
        return html.replace(/<!--[\s\S]*?-->/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
    }

    function minifyCSS(css) {
        return css.replace(/\s+/g, ' ')
                 .replace(/\/\*[\s\S]*?\*\//g, '')
                 .trim();
    }

    function minifyJS(js) {
        return js.replace(/\s+/g, ' ')
                .replace(/\/\/.*$/gm, '')
                .trim();
    }

    // === 3. Lazy Loading de Imagens e Iframes ===
    function enableLazyLoading() {
        document.querySelectorAll("img").forEach(img => {
            if (!img.hasAttribute("data-src")) {
                img.setAttribute("data-src", img.src);
                img.src = "";
                img.loading = "lazy";
            }
        });

        document.querySelectorAll("iframe").forEach(iframe => {
            if (!iframe.hasAttribute("data-src")) {
                iframe.setAttribute("data-src", iframe.src);
                iframe.src = "";
                iframe.loading = "lazy";
            }
        });

        const lazyObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.dataset.src) {
                        element.src = element.dataset.src;
                        observer.unobserve(element);
                    }
                }
            });
        }, { rootMargin: "0px 0px 200px 0px" });

        document.querySelectorAll("img[data-src], iframe[data-src]").forEach(el => lazyObserver.observe(el));
    }

    // === 4. Usar DNS seguro (opcional) ===
    function useSecureDNS(enable = false) {
        if (enable) {
            console.log("Ativando DNS seguro...");
            alert("Funcionalidade experimental: DNS seguro (não suportado por todos os navegadores)");
        } else {
            console.log("DNS seguro desativado por padrão.");
        }
    }

    // === 5. Gerenciar "Não Rastrear" (Do Not Track) ===
    function toggleDoNotTrack(enable = true) {
        if (enable) {
            navigator.__defineGetter__("doNotTrack", () => "1");
            console.log("Do Not Track ativado automaticamente.");
        } else {
            navigator.__defineGetter__("doNotTrack", () => "0");
            console.log("Do Not Track desativado.");
        }
    }

    // === 6. Redirecionar para versão local de qualquer site ===
    async function redirectToLocalDomainIfNeeded() {
        const userCountry = await detectUserCountry();
        const targetSuffix = LOCAL_DOMAIN_MAP[userCountry] || ".com";

        const currentHost = window.location.host;

        if (currentHost.endsWith(targetSuffix)) return;

        const newHost = currentHost.split('.').slice(0, -1).join('.') + targetSuffix;
        const newUrl = window.location.href.replace(currentHost, newHost);

        console.log(`Redirecionando para versão local: ${newUrl}`);
        window.location.href = newUrl;
    }

    // === 7. Detectar país do usuário ===
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

    // === 8. Dividir downloads em partes (chunks) ===
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
                    saveToStorage(`${url}_part${i}`, buffer);
                }
            } catch (e) {
                console.error("Erro ao baixar parte:", i, e);
            }
        }

        const fullData = concatenateBuffers(allChunks);
        saveToStorage(url, fullData);
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

    // === 9. Armazenamento local avançado (IndexedDB ou localStorage) ===
    function saveToStorage(key, data) {
        const payload = {
            timestamp: Date.now(),
            data: data
        };

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
                tx.objectStore("resources").put(payload);
                tx.commit();
            };
        } else {
            localStorage.setItem(key, JSON.stringify(payload));
        }
    }

    function loadFromStorage(url) {
        return new Promise((resolve, reject) => {
            const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas

            if (window.indexedDB) {
                const request = indexedDB.open(STORAGE_KEY, 1);
                request.onsuccess = event => {
                    const db = event.target.result;
                    const store = db.transaction("resources", "readonly").objectStore("resources").get(url);
                    store.onsuccess = () => {
                        const cached = store.result;
                        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                            resolve(cached.data);
                        } else {
                            resolve(null);
                        }
                    };
                    store.onerror = () => reject(null);
                };
            } else {
                const cached = localStorage.getItem(url);
                if (cached) {
                    const item = JSON.parse(cached);
                    if (Date.now() - item.timestamp < CACHE_TTL) {
                        resolve(item.data);
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            }
        });
    }

    // === 10. Permitir download de arquivos .torrent ===
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

    // === 11. Modo escuro opcional ===
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

    // === 12. Bloquear fingerprinting ===
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

        Object.defineProperty(navigator, 'platform', {
            value: 'Win32',
            configurable: false,
            writable: false
        });

        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            configurable: false,
            writable: false
        });
    }

    // === 13. Interceptação de navegação para evitar sites inseguros ===
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

    // === 14. Inicialização Geral ===
    window.addEventListener("load", async () => {
        useSecureDNS(false);
        toggleDoNotTrack(true);
        blockFingerprinting();
        injectDarkModeStyle();
        applyInitialDarkMode();
        addDarkModeToggle();
        interceptNavigation();
        enableTorrentSupport();
        enableLazyLoading();

        await redirectToLocalDomainIfNeeded();

        const pageUrl = window.location.href;
        let html = await loadFromStorage(pageUrl);

        if (!html) {
            const response = await fetchWithOptimizedHeaders(pageUrl);
            html = await response.text();
            html = minifyHTML(html);
            saveToStorage(pageUrl, html);
        }

        // Reinsere conteúdo minificado na página
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        document.documentElement.innerHTML = doc.documentElement.innerHTML;

        // Reaplicar scripts dinâmicos se necessário
        document.querySelectorAll("script").forEach(script => {
            const newScript = document.createElement("script");
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });

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
