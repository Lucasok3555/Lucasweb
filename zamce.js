(function () {
    'use strict';

    // === Variáveis Globais ===
    const STORAGE_KEY = "zamce_cache";
    const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB por parte
    const LOCAL_DOMAIN_MAP = {
        "BR": ".com.br",
        "US": ".com",
        "DE": ".de",
        "FR": ".fr"
    };

    // === Configuração I2P ===
    const I2P_GATEWAY = "https://i2pgate.io/i2p/ ";

    // === Lista de Rastreadores Conhecidos ===
    const TRACKERS = [
        "google-analytics.com",
        "googlesyndication.com",
        "doubleclick.net",
        "facebook.com/pixel"
    ];

    // === Simulação de Rede P2P ===
    const P2P_NETWORK = [];

    // === Identidade do Usuário na Rede P2P ===
    const USER_ID = Math.random().toString(36).substring(2, 15) + Date.now();

    // === 1. Carregar página via I2P se for .i2p ===
    function loadI2PSite(url) {
        if (url.endsWith(".i2p")) {
            console.log("Tentando carregar site I2P através do gateway:", url);
            return I2P_GATEWAY + encodeURIComponent(url.replace(".i2p", ""));
        }
        return url;
    }

    // === 2. Encontrar rota mais rápida (HTTP/3-like) ===
    async function fetchWithOptimizedHeaders(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

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

    // === 3. Minificação de conteúdo ===
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

    // === 4. Lazy Loading de Imagens e Iframes ===
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

    // === 5. Gerenciar "Não Rastrear" (Do Not Track) ===
    function toggleDoNotTrack(enable = true) {
        if (enable) {
            Object.defineProperty(navigator, 'doNotTrack', {
                value: '1',
                configurable: false,
                writable: false
            });
            console.log("Do Not Track ativado automaticamente.");
        } else {
            delete navigator.doNotTrack;
            console.log("Do Not Track desativado.");
        }
    }

    // === 6. Bloqueio de Sites Perigosos ===
    function isDangerousLink(url) {
        const DANGEROUS_DOMAINS = [
            "malware.com",
            "phishing.net",
            "fake-login.org",
            "evil-tracking.com"
        ];
        return DANGEROUS_DOMAINS.some(domain => url.includes(domain));
    }

    // === 7. Interceptação de navegação para evitar sites inseguros ===
    function interceptNavigation() {
        document.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", e => {
                const href = link.getAttribute("href");
                if (href && href.startsWith("http://")) {
                    e.preventDefault();
                    alert("Este site usa HTTP inseguro. Tente usar HTTPS ou IPFS.");
                }
                if (isDangerousLink(href)) {
                    e.preventDefault();
                    alert("Este site é considerado perigoso e foi bloqueado.");
                }
            });
        });
    }

    // === 8. Armazenamento local avançado (IndexedDB) ===
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

    // === 9. Rede P2P Básica (simulada) ===
    function connectToP2PNetwork() {
        console.log(`Conectado à rede P2P como ${USER_ID}`);
        window.addEventListener("storage", e => {
            if (e.key && e.key.startsWith("p2p_")) {
                const peerData = JSON.parse(e.newValue);
                console.log(`Recebido conteúdo P2P de ${peerData.user}`);
                if (peerData.url && peerData.content) {
                    saveToStorage(peerData.url, peerData.content);
                }
            }
        });
    }

    function sharePageToP2P(url, content) {
        const p2pData = JSON.stringify({
            user: USER_ID,
            url: url,
            content: content
        });
        localStorage.setItem(`p2p_${Date.now()}`, p2pData);
        console.log("Conteúdo compartilhado na rede P2P.");
    }

    // === 10. Verificar se há conteúdo disponível na rede P2P ===
    async function checkP2PForContent(url) {
        const keys = Object.keys(localStorage).filter(k => k.startsWith("p2p_"));
        for (const key of keys) {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.url === url) {
                console.log("Conteúdo encontrado na rede P2P!");
                return data.content;
            }
        }
        return null;
    }

    // === 11. Baixar páginas com suporte P2P ===
    async function fetchPage(url) {
        let html = await loadFromStorage(url);
        if (!html) {
            html = await fetchFromP2P(url); // Primeiro tenta P2P
            if (!html) {
                const finalUrl = loadI2PSite(url);
                const response = await fetchWithOptimizedHeaders(finalUrl);
                html = await response.text();
                html = minifyHTML(html);
                saveToStorage(url, html);
                sharePageToP2P(url, html); // Compartilha na rede P2P
            }
        }
        return html;
    }

    async function fetchFromP2P(url) {
        const p2pContent = await checkP2PForContent(url);
        if (p2pContent) return p2pContent;
        return null;
    }

    // === 12. Editar identidade do navegador ===
    function editBrowserIdentity() {
        const fakeUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ZamCE/1.0 Safari/537.36";

        Object.defineProperty(navigator, 'userAgent', {
            value: fakeUserAgent,
            configurable: false,
            writable: false
        });

        Object.defineProperty(navigator, 'appVersion', {
            value: "5.0 (X11)",
            configurable: false,
            writable: false
        });

        Object.defineProperty(navigator, 'platform', {
            value: "Linux x86_64",
            configurable: false,
            writable: false
        });

        Object.defineProperty(navigator, 'deviceMemory', {
            value: 8,
            configurable: false,
            writable: false
        });

        console.log("Identidade do navegador foi mascarada.");
    }

    // === 13. Mensagem de Boas-Vindas ===
    function showWelcomeMessage() {
        const msg = document.createElement("div");
        msg.style.position = "fixed";
        msg.style.bottom = "20px";
        msg.style.right = "20px";
        msg.style.zIndex = "99999";
        msg.style.background = "#28a745";
        msg.style.color = "#fff";
        msg.style.padding = "10px 15px";
        msg.style.borderRadius = "8px";
        msg.style.fontFamily = "Arial, sans-serif";
        msg.style.fontSize = "14px";
        msg.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
        msg.style.opacity = "0";
        msg.style.transition = "opacity 0.5s ease-in-out";
        msg.textContent = "Bem-vindo ao ZamCE! Navegação segura e P2P ativada.";

        document.body.appendChild(msg);

        setTimeout(() => {
            msg.style.opacity = "1";
        }, 500);

        setTimeout(() => {
            msg.style.opacity = "0";
            setTimeout(() => msg.remove(), 500);
        }, 4000);
    }

    // === 14. Barra de busca integrada ao DuckDuckGo ===
    function addDuckDuckGoSearchBar() {
        const wrapper = document.createElement("div");
        wrapper.style.position = "fixed";
        wrapper.style.top = "10px";
        wrapper.style.left = "10px";
        wrapper.style.zIndex = "99999";
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.background = "#fff";
        wrapper.style.borderRadius = "8px";
        wrapper.style.border = "1px solid #ccc";
        wrapper.style.padding = "6px 10px";
        wrapper.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
        wrapper.style.width = "300px";
        wrapper.style.fontFamily = "Arial, sans-serif";

        const icon = document.createElement("img");
        icon.src = "https://duckduckgo.com/favicon.ico ";
        icon.alt = "DuckDuckGo";
        icon.style.width = "20px";
        icon.style.height = "20px";
        icon.style.marginRight = "8px";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Pesquisar no DuckDuckGo...";
        input.style.flex = "1";
        input.style.border = "none";
        input.style.outline = "none";
        input.style.fontSize = "14px";
        input.style.padding = "4px 0";

        wrapper.appendChild(icon);
        wrapper.appendChild(input);
        document.body.appendChild(wrapper);

        input.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                const query = encodeURIComponent(input.value.trim());
                if (query) {
                    window.location.href = `https://duckduckgo.com/?q= ${query}`;
                }
            }
        });
    }

    // === 15. Inicialização Geral ===
    window.addEventListener("load", async () => {
        editBrowserIdentity(); // <<< NOVA FUNÇÃO ADICIONADA
        toggleDoNotTrack(true);
        interceptNavigation();
        enableLazyLoading();
        connectToP2PNetwork(); // <<< NOVA FUNÇÃO ADICIONADA

        addDuckDuckGoSearchBar();
        showWelcomeMessage();

        const pageUrl = window.location.href;

        // Exemplo: Google.com → Busca em P2P primeiro
        let html = await fetchPage(pageUrl);

        if (!html) {
            const response = await fetchWithOptimizedHeaders(pageUrl);
            html = await response.text();
            html = minifyHTML(html);
            saveToStorage(pageUrl, html);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        document.documentElement.innerHTML = doc.documentElement.innerHTML;

        // Reaplicar scripts dinâmicos
        document.querySelectorAll("script").forEach(script => {
            const newScript = document.createElement("script");
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });

        // Botão para ativar DNS seguro (simulado)
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
            alert("Funcionalidade experimental: DNS seguro não é suportado diretamente no navegador.");
        };

        document.body.appendChild(dnsButton);
    });

})();
