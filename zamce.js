(function () {
    'use strict';

    // 1. Forçar modo escuro e impedir mudança para modo claro
    function enableDarkMode() {
        const style = document.createElement('style');
        style.textContent = `
            html, body {
                background-color: #121212 !important;
                color: #f0f0f0 !important;
            }
            img {
                filter: invert(1) hue-rotate(180deg);
            }
        `;
        document.head.appendChild(style);

        window.matchMedia('(prefers-color-scheme: light)').addListener(e => {
            if (e.matches) enableDarkMode();
        });
    }

    // 2. Tradução automática usando JSON externo
    async function autoTranslatePage(jsonUrl = "https://lucasok3555.github.io/Lucasweb/Tradu ção.json") {
        const textElements = document.querySelectorAll("body *");
        let content = "";

        textElements.forEach(el => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                content += el.innerText + " ";
            }
        });

        if (content.trim().length > 10) {
            try {
                const response = await fetch(jsonUrl);
                const dict = await response.json();

                const translated = content.split(" ").map(word => {
                    return dict[word.toLowerCase()] || word;
                }).join(" ");

                console.log("Texto traduzido:", translated);
                alert("Tradução concluída. Veja no console.");
            } catch (e) {
                console.error("Erro ao carregar dicionário de tradução", e);
            }
        }
    }

    // 3. Buscar melhor DNS disponível na rede
    function findBestDNS(servers = ["1.1.1.1", "8.8.8.8", "9.9.9.9"]) {
        console.log("Buscando melhor servidor DNS...");
        servers.forEach((server, i) => {
            setTimeout(() => {
                fetch(`https://${server}/dns-query`)
                    .then(res => {
                        if (res.ok) {
                            console.log("Servidor DNS rápido encontrado:", server);
                            localStorage.setItem("best_dns", server);
                        }
                    })
                    .catch(() => {});
            }, i * 200); // Testa cada um com pequeno delay
        });
    }

    // 4. Escolher a melhor rota para pacotes
    function selectBestRoute(routes = ["/route/a", "/route/b", "/route/c"]) {
        routes.forEach(route => {
            const start = performance.now();
            fetch(route)
                .then(() => {
                    const duration = performance.now() - start;
                    console.log(`Rota "${route}" levou ${duration.toFixed(2)}ms`);
                    localStorage.setItem("best_route", route);
                })
                .catch(() => {});
        });
    }

    // 5. Bloquear registradores (cookies, localStorage, etc.)
    function blockTrackers() {
        console.log("Bloqueando registradores...");
        navigator.__defineGetter__('userAgent', () => {
            console.warn("User-Agent ocultado");
            return "Mozilla/5.0 (CustomBrowser)";
        });

        // Bloquear cookies
        document.__defineGetter__('cookie', () => {
            console.warn("Acesso a cookies bloqueado");
            return '';
        });

        document.__defineSetter__('cookie', () => {
            console.warn("Escrita de cookie bloqueada");
            return '';
        });

        // Bloquear localStorage
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (!key.includes("cache_")) {
                console.warn("Armazenamento bloqueado:", key);
                return;
            }
            return originalSetItem.apply(this, arguments);
        };
    }

    // 6. Bloquear pressão digital (digital fingerprint)
    function blockFingerprinting() {
        console.log("Bloqueando pressão digital...");

        // Sobrescreve métodos usados para fingerprint
        CanvasRenderingContext2D.prototype.fillText = function() {
            console.warn("Canvas fingerprint bloqueado");
        };

        WebGLRenderingContext.prototype.getParameter = function() {
            console.warn("WebGL fingerprint bloqueado");
        };

        // Bloqueia acesso a plugins e dispositivos
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

    // 7. Limpar pressões digitais automaticamente
    function clearFingerprintData() {
        console.log("Limpando dados temporários de fingerprint...");
        localStorage.removeItem("canvas_hash");
        localStorage.removeItem("webgl_hash");
        sessionStorage.clear();
    }

    // 8. Salvar informações no cache ("caixa")
    function saveToCache(name, data) {
        localStorage.setItem("cache_" + name, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));
    }

    // 9. Carregar diretamente do cache ("caixa")
    function loadFromCache(name) {
        const cached = localStorage.getItem("cache_" + name);
        if (cached) {
            console.log("Carregando do cache:", name);
            return JSON.parse(cached).data;
        }
        return null;
    }

    // 10. Enviar pacotes pela melhor rota
    function sendPacket(url, payload) {
        const bestRoute = localStorage.getItem("best_route") || url;
        console.log("Enviando pacote pela melhor rota:", bestRoute);

        fetch(bestRoute, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        }).then(res => {
            console.log("Pacote enviado com sucesso!");
        }).catch(err => {
            console.error("Erro ao enviar pacote:", err);
        });
    }

    // Executar funções ao carregar a página
    window.addEventListener("load", () => {
        enableDarkMode();
        blockTrackers();
        blockFingerprinting();
        clearFingerprintData();
        findBestDNS();
        selectBestRoute();
        autoTranslatePage();
    });

    // Exportando algumas funções para uso externo
    window.darkok = {
        enableDarkMode,
        blockTrackers,
        blockFingerprinting,
        clearFingerprintData,
        findBestDNS,
        selectBestRoute,
        autoTranslatePage,
        saveToCache,
        loadFromCache,
        sendPacket
    };

})();
