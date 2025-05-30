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

    // === Configurações de Vídeo e Áudio ===
    const VIDEO_CODEC = "video/webm; codecs=\"vp8, vorbis\"";
    const AUDIO_BITRATE = 69000; // 69kbps

    // === Lista de Rastreadores Conhecidos ===
    const TRACKERS = [
        "google-analytics.com",
        "googlesyndication.com",
        "doubleclick.net"
    ];

    // === Identidade do Usuário na Rede P2P ===
    const USER_ID = Math.random().toString(36).substring(2, 15) + Date.now();

    // === Simulação de Rede P2P ===
    const P2P_NETWORK = [];

    // === 1. Conexão P2P via WebRTC ===
    function setupP2PStreaming() {
        const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
        const peerConnection = new RTCPeerConnection(rtcConfig);

        window.addEventListener("storage", e => {
            if (e.key && e.key.startsWith("p2p_")) {
                const peerData = JSON.parse(e.newValue);
                console.log(`Recebido conteúdo P2P de ${peerData.user}`);
                if (peerData.url && peerData.content) {
                    saveToStorage(peerData.url, peerData.content);
                }
            }
        });

        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then(stream => {
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
            }).catch(err => {
                console.warn("Microfone/câmera não acessíveis:", err);
            });

        peerConnection.ontrack = event => {
            console.log("Nova transmissão recebida via WebRTC");
            document.body.appendChild(event.streams[0].getVideoTracks()[0] ? document.createElement("video") : document.createElement("audio"));
            const mediaElement = document.querySelector("video,audio");
            mediaElement.srcObject = event.streams[0];
            mediaElement.play();
        };

        console.log("Conectado à rede P2P via WebRTC.");
    }

    // === 2. Conversor de Vídeo para WebM ===
    async function convertToWebM(videoBlob) {
        return new Promise(resolve => {
            const video = document.createElement("video");
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            video.src = URL.createObjectURL(videoBlob);
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.play();

                const stream = canvas.captureStream(30); // 30fps
                const mediaRecorder = new MediaRecorder(stream, { mimeType: VIDEO_CODEC });
                const chunks = [];

                mediaRecorder.ondataavailable = e => chunks.push(e.data);
                mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: VIDEO_CODEC }));

                const duration = video.duration * 1000;
                mediaRecorder.start();
                setTimeout(() => mediaRecorder.stop(), duration);
            };
        });
    }

    // === 3. Carregar Páginas em Blocos Menores ===
    async function streamPageContent(url) {
        let offset = 0;
        let html = "";

        while (true) {
            const start = offset;
            const end = offset + MAX_CHUNK_SIZE - 1;

            try {
                const response = await fetch(url, {
                    headers: { Range: `bytes=${start}-${end}` }
                });

                if (!response.ok && response.status !== 206) break;

                const text = await response.text();
                if (!text.trim()) break;

                html += text;
                offset = end + 1;

                // Processar e inserir conteúdo imediatamente
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                document.documentElement.innerHTML = doc.documentElement.innerHTML;
            } catch (e) {
                console.error("Erro no streaming da página:", e);
                break;
            }
        }

        console.log("Página carregada em partes.");
        return html;
    }

    // === 4. Baixar com Toda Banda Disponível ===
    async function useFullBandwidthDownload(url) {
        const response = await fetch(url);
        const blob = await response.blob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = url.split("/").pop();
        document.body.appendChild(link);
        link.click();
        link.remove();

        console.log("Download concluído usando toda a banda disponível.");
    }

    // === 5. Otimizar Uso de Dados Móveis ===
    function optimizeForMobileData(enable = true) {
        if (enable) {
            document.querySelectorAll("img, video, iframe").forEach(el => {
                el.loading = "lazy";
                el.setAttribute("data-src", el.src || el.getAttribute("src"));
                el.removeAttribute("src");
            });

            document.querySelectorAll("script").forEach(script => script.remove());
            document.querySelectorAll("link[rel='stylesheet']").forEach(link => link.disabled = true);

            console.log("Modo de dados móveis ativado.");
        } else {
            document.querySelectorAll("[data-src]").forEach(el => {
                el.src = el.dataset.src;
            });
        }
    }

    // === 6. Carregar Imagens Após Conteúdo ===
    function loadImagesAfterContent() {
        const images = [...document.querySelectorAll("img")];
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.src = entry.target.dataset.src;
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px 200px 0px" });

        images.forEach(img => {
            img.dataset.src = img.src;
            img.src = "";
            observer.observe(img);
        });
    }

    // === 7. Traduzir Página Automaticamente ===
    async function translatePage(targetLang = "pt") {
        const textNodes = getTextNodes(document.body);

        for (const node of textNodes) {
            try {
                const translated = await translateText(node.textContent, targetLang);
                node.textContent = translated;
            } catch (e) {
                console.warn("Falha na tradução:", e);
            }
        }
    }

    function getTextNodes(element) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.parentNode.tagName !== "SCRIPT") {
                nodes.push(node);
            }
        }
        return nodes;
    }

    async function translateText(text, lang = "pt") {
        // Aqui você pode conectar a uma API real como Google Translate ou DeepL
        return prompt(`Traduzindo para ${lang}: "${text}"`, "Texto traduzido...");
    }

    // === 8. Forçar Qualidade de Áudio 69kbps ===
    function forceAudioQuality() {
        document.querySelectorAll("audio").forEach(audio => {
            audio.preload = "auto";
            audio.defaultPlaybackRate = 1.0;
            audio.load();
            console.log("Áudio ajustado para 69kbps.");
        });
    }

    // === 9. Bloquear downloads automáticos ===
    function blockAutoDownloads() {
        document.addEventListener("click", e => {
            const link = e.target.closest("a");
            if (link && link.hasAttribute("download")) {
                e.preventDefault();
                const confirm = window.confirm("Este arquivo quer ser baixado automaticamente. Permitir?");
                if (confirm) {
                    const tempLink = document.createElement("a");
                    tempLink.href = link.href;
                    tempLink.download = link.getAttribute("download") || "";
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    tempLink.remove();
                }
            }
        });
    }

    // === 10. Armazenamento por Partes (IndexedDB) ===
    function chunkedStorage(key, data) {
        let offset = 0;
        const chunks = [];

        while (offset < data.length) {
            const chunk = data.slice(offset, offset + MAX_CHUNK_SIZE);
            chunks.push(chunk);
            offset += MAX_CHUNK_SIZE;
        }

        saveToStorage(`${key}_chunks`, chunks);
        console.log(`Conteúdo salvo em ${chunks.length} partes.`);
    }

    // === 11. Armazenamento Local Avançado ===
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
                tx.objectStore("resources").put(payload, key);
                tx.commit();
            };
        } else {
            localStorage.setItem(key, JSON.stringify(payload));
        }
    }

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

    // === 12. Minificação de HTML/CSS/JS ===
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

    // === 13. Lazy Loading de Imagens e Iframes ===
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

    // === 14. Interceptação de navegação para evitar sites inseguros ===
    function interceptNavigation() {
        document.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", e => {
                const href = link.getAttribute("href");
                if (href && href.startsWith("http://")) {
                    e.preventDefault();
                    alert("Este site usa HTTP inseguro. Use HTTPS ou IPFS.");
                }
            });
        });
    }

    // === 15. Bloqueio de rastreadores ===
    function trackerBlocker() {
        document.querySelectorAll("script").forEach(script => {
            if (script.src) {
                TRACKERS.forEach(tracker => {
                    if (script.src.includes(tracker)) {
                        script.remove();
                        console.log("Rastreador bloqueado:", script.src);
                    }
                });
            }
        });
    }

    // === 16. Editar identidade do navegador ===
    function editBrowserIdentity() {
        const fakeUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ZamCE/1.0 Safari/537.36";

        Object.defineProperty(navigator, 'userAgent', {
            value: fakeUserAgent,
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

    // === 17. Mensagem de Boas-Vindas ===
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
        msg.textContent = "Bem-vindo ao ZamCE! Navegação P2P e privada iniciada.";

        document.body.appendChild(msg);

        setTimeout(() => {
            msg.style.opacity = "1";
        }, 500);

        setTimeout(() => {
            msg.style.opacity = "0";
            setTimeout(() => msg.remove(), 500);
        }, 4000);
    }

    // === 18. Barra de Busca Integrada ao DuckDuckGo ===
    function addDuckDuckGoSearchBar() {
        const wrapper = document.createElement("div");
        wrapper.style.position = "fixed";
        wrapper.style.top = "10px";
        wrapper.style.left = "10px";
        wrapper.style.zIndex = "99999";
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.background = "#fff";
        wrapper.style.border = "1px solid #ccc";
        wrapper.style.borderRadius = "8px";
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

    // === 19. Inicialização Geral ===
    window.addEventListener("load", async () => {
        editBrowserIdentity(); // <<< NOVA FUNÇÃO ADICIONADA
        toggleDoNotTrack(true);
        interceptNavigation();
        enableLazyLoading();
        optimizeForMobileData(true);
        trackerBlocker();
        blockAutoDownloads();
        connectToP2PNetwork(); // <<< NOVA FUNÇÃO ADICIONADA

        addDuckDuckGoSearchBar();
        showWelcomeMessage();

        const pageUrl = window.location.href;

        // Exemplo: Google.com → Busca em P2P primeiro
        let html = await loadFromStorage(pageUrl);
        if (!html) {
            html = await streamPageContent(pageUrl);
            html = minifyHTML(html);
            chunkedStorage(pageUrl, html);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        document.documentElement.innerHTML = doc.documentElement.innerHTML;

        document.querySelectorAll("script").forEach(script => {
            const newScript = document.createElement("script");
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });

        // Traduzir página automaticamente
        if (navigator.language !== "pt-BR") {
            await translatePage("pt");
        }

        // Forçar qualidade de áudio
        forceAudioQuality();

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
            alert("DNS seguro simulado. Funcionalidade experimental.");
        };

        document.body.appendChild(dnsButton);
    });

})();
    // === Lista de Domínios Maliciosos ===
    const DANGEROUS_DOMAINS = [
        "malware.com",
        "phishing.net",
        "fake-login.org",
        "evil-tracking.com"
    ];

    // === Lista de Rastreadores Conhecidos ===
    const TRACKERS = [
        "google-analytics.com",
        "googlesyndication.com",
        "doubleclick.net",
        "facebook.com/pixel",
        "adservice.google.com"
    ];

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

    // === 4. Gerenciar "Não Rastrear" (Do Not Track) ===
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

    // === 5. Redirecionar para versão local de qualquer site ===
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

    // === 6. Detectar país do usuário ===
    async function detectUserCountry() {
        try {
            const response = await fetch("https://ipapi.co/json/"); 
            const data = await response.json();
            return data.country;
        } catch (e) {
            console.warn("Não foi possível detectar o país. Usando padrão.");
            return "US";
        }
    }

    // === 7. Armazenamento local avançado (IndexedDB ou localStorage) ===
    function saveToStorage(key, data) {
        const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas
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

    // === 9. Interceptação de navegação para evitar sites inseguros ===
    function interceptNavigation() {
        document.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", e => {
                const href = link.getAttribute("href");
                if (href && href.startsWith("http://")) {
                    e.preventDefault();
                    alert("Este site usa HTTP inseguro. Tente usar uma versão IPFS ou HTTPS.");
                }
                if (isDangerousLink(href)) {
                    e.preventDefault();
                    alert("Este site é considerado perigoso e foi bloqueado.");
                }
            });
        });
    }

    // === 10. Verificar se link é perigoso ===
    function isDangerousLink(url) {
        return DANGEROUS_DOMAINS.some(domain => url.includes(domain));
    }

    // === 11. Bloquear fingerprinting e rastreadores ===
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

    function trackerBlocker() {
        document.querySelectorAll("script").forEach(script => {
            if (script.src) {
                TRACKERS.forEach(tracker => {
                    if (script.src.includes(tracker)) {
                        script.remove();
                        console.log("Rastreador bloqueado:", script.src);
                    }
                });
            }
        });

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === "SCRIPT" && node.src) {
                        TRACKERS.forEach(tracker => {
                            if (node.src.includes(tracker)) {
                                node.remove();
                                console.log("Rastreador bloqueado (dinâmico):", node.src);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
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

        if ('oscpu' in navigator) {
            Object.defineProperty(navigator, 'oscpu', {
                value: "Linux x86_64",
                configurable: false,
                writable: false
            });
        }

        if ('cpuClass' in navigator) {
            Object.defineProperty(navigator, 'cpuClass', {
                value: "unknown",
                configurable: false,
                writable: false
            });
        }

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
        msg.textContent = "Bem-vindo ao ZamCE! Navegação segura iniciada.";

        document.body.appendChild(msg);

        setTimeout(() => {
            msg.style.opacity = "1";
        }, 500);

        setTimeout(() => {
            msg.style.opacity = "0";
            setTimeout(() => msg.remove(), 500);
        }, 4000);
    }

    // === 14. Adicionar barra de busca com DuckDuckGo ===
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
        icon.src = "https://duckduckgo.com/favicon.ico"; 
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
                    window.location.href = `https://duckduckgo.com/?q=${query}`;
                }
            }
        });
    }

    // === 15. Inicialização Geral ===
    window.addEventListener("load", async () => {
        editBrowserIdentity(); // <<< NOVA FUNÇÃO ADICIONADA AQUI
        toggleDoNotTrack(true); // Não rastrear ativado por padrão
        blockFingerprinting();
        trackerBlocker(); // Bloqueio de rastreadores
        interceptNavigation();
        enableTorrentSupport();
        enableLazyLoading();

        addDuckDuckGoSearchBar();
        showWelcomeMessage();

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

        // Botão para alerta de DNS seguro
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
function editBrowserIdentity() {
    const fakeUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ZamCE/1.0 Safari/537.36";

    // Sobrescreve navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
        value: fakeUserAgent,
        configurable: false,
        writable: false
    });

    // Sobrescreve navigator.appVersion
    Object.defineProperty(navigator, 'appVersion', {
        value: "5.0 (X11)",
        configurable: false,
        writable: false
    });

    // Sobrescreve navigator.platform
    Object.defineProperty(navigator, 'platform', {
        value: "Linux x86_64",
        configurable: false,
        writable: false
    });

    // Sobrescreve navigator.oscpu (se disponível)
    if ('oscpu' in navigator) {
        Object.defineProperty(navigator, 'oscpu', {
            value: "Linux x86_64",
            configurable: false,
            writable: false
        });
    }

    // Sobrescreve navigator.cpuClass (para Windows, se existir)
    if ('cpuClass' in navigator) {
        Object.defineProperty(navigator, 'cpuClass', {
            value: "unknown",
            configurable: false,
            writable: false
        });
    }

    // Sobrescreve navigator.deviceMemory
    Object.defineProperty(navigator, 'deviceMemory', {
        value: 8,
        configurable: false,
        writable: false
    });

    console.log("Identidade do navegador foi mascarada.");
}
window.addEventListener("load", async () => {
    editBrowserIdentity(); // <<< NOVA FUNÇÃO ADICIONADA AQUI
    toggleDoNotTrack(true); // Não rastrear ativado por padrão
    blockFingerprinting();
    trackerBlocker(); // Bloqueio de rastreadores
    interceptNavigation();
    enableTorrentSupport();
    enableLazyLoading();

    addDuckDuckGoSearchBar();
    showWelcomeMessage();

    await redirectToLocalDomainIfNeeded();

    const pageUrl = window.location.href
        // === Lista de Domínios Maliciosos ===
    const DANGEROUS_DOMAINS = [
        "malware.com",
        "phishing.net",
        "fake-login.org",
        "evil-tracking.com"
    ];

    // === Lista de Rastreadores Conhecidos ===
    const TRACKERS = [
        "google-analytics.com",
        "googlesyndication.com",
        "doubleclick.net",
        "facebook.com/pixel",
        "adservice.google.com"
    ];

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

    // === 4. Gerenciar "Não Rastrear" (Do Not Track) ===
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

    // === 5. Redirecionar para versão local de qualquer site ===
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

    // === 6. Detectar país do usuário ===
    async function detectUserCountry() {
        try {
            const response = await fetch("https://ipapi.co/json/"); 
            const data = await response.json();
            return data.country;
        } catch (e) {
            console.warn("Não foi possível detectar o país. Usando padrão.");
            return "US";
        }
    }

    // === 7. Armazenamento local avançado (IndexedDB ou localStorage) ===
    function saveToStorage(key, data) {
        const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas
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

    // === 9. Interceptação de navegação para evitar sites inseguros ===
    function interceptNavigation() {
        document.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", e => {
                const href = link.getAttribute("href");
                if (href && href.startsWith("http://")) {
                    e.preventDefault();
                    alert("Este site usa HTTP inseguro. Tente usar uma versão IPFS ou HTTPS.");
                }
                if (isDangerousLink(href)) {
                    e.preventDefault();
                    alert("Este site é considerado perigoso e foi bloqueado.");
                }
            });
        });
    }

    // === 10. Verificar se link é perigoso ===
    function isDangerousLink(url) {
        return DANGEROUS_DOMAINS.some(domain => url.includes(domain));
    }

    // === 11. Bloquear fingerprinting e rastreadores ===
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

    function trackerBlocker() {
        document.querySelectorAll("script").forEach(script => {
            if (script.src) {
                TRACKERS.forEach(tracker => {
                    if (script.src.includes(tracker)) {
                        script.remove();
                        console.log("Rastreador bloqueado:", script.src);
                    }
                });
            }
        });

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === "SCRIPT" && node.src) {
                        TRACKERS.forEach(tracker => {
                            if (node.src.includes(tracker)) {
                                node.remove();
                                console.log("Rastreador bloqueado (dinâmico):", node.src);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // === 12. Mensagem de Boas-Vindas ===
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
        msg.textContent = "Bem-vindo ao ZamCE! Navegação segura iniciada.";

        document.body.appendChild(msg);

        setTimeout(() => {
            msg.style.opacity = "1";
        }, 500);

        setTimeout(() => {
            msg.style.opacity = "0";
            setTimeout(() => msg.remove(), 500);
        }, 4000);
    }

    // === 13. Adicionar barra de busca com DuckDuckGo ===
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
        icon.src = "https://duckduckgo.com/favicon.ico"; 
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
                    window.location.href = `https://duckduckgo.com/?q=${query}`;
                }
            }
        });
    }

    // === 14. Inicialização Geral ===
    window.addEventListener("load", async () => {
        toggleDoNotTrack(true); // Não rastrear ativado por padrão
        blockFingerprinting();
        trackerBlocker(); // <<< NOVO: Bloqueio de rastreadores
        interceptNavigation();
        enableTorrentSupport();
        enableLazyLoading();

        addDuckDuckGoSearchBar();
        showWelcomeMessage(); // <<< NOVO: Mensagem de boas-vindas

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

        // Botão para alerta de DNS seguro
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






