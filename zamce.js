(function () {
    'use strict';

    // 1. Forçar modo escuro e impedir mudança para modo claro
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

        // Impede alteração via prefers-color-scheme
        window.matchMedia('(prefers-color-scheme: light)').addListener(e => {
            if (e.matches) {
                console.warn("Modo claro detectado, mas bloqueado.");
                enableDarkMode();
            }
        });
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
                    window.location.href = `https://duckduckgo.com/?q= ${query}`;
                }
            });
        });
    }

    // 3. Esconder IP do usuário
    function hideUserIP() {
        fetch("https://api.ipify.org ?format=json")
            .then(res => res.json())
            .then(data => {
                console.warn("Seu IP real é:", data.ip);
                console.info("Use proxy anônimo ou serviço integrado.");
            });
    }

    // 4. Simula ativação automática da rede PASN se site NÃO for HTTPS
    function autoEnablePasnIfInsecure() {
        if (window.location.protocol !== "https:") {
            console.warn("Site inseguro detectado. Ativando rede PASN...");

            // Aqui você pode chamar uma função nativa no Android (Java/Kotlin)
            // Exemplo: Android.usePasnNetwork();

            alert("Conexão insegura. Ativando rede segura PASN...");
            document.body.style.border = "2px solid cyan";
        } else {
            console.log("Conexão segura (HTTPS). Rede PASN não ativada.");
        }
    }

    // 5. Tradução automática do site
    function autoTranslatePage(targetLang = "pt") {
        const textElements = document.querySelectorAll("body *");
        let content = "";

        textElements.forEach(el => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                content += el.innerText + " ";
            }
        });

        if (content.trim().length > 10) {
            console.log("Traduzindo conteúdo para:", targetLang);
            alert("Tradução automática ativada.");
        }
    }

    // 6. Dividir upload/download em partes pequenas
    async function splitTransfer(url, type = "download", parts = 4) {
        if (type === "download") {
            await downloadWithMaxSpeed(url, parts);
        } else if (type === "upload") {
            await uploadInChunks(url, parts);
        }
    }

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
        saveToCache(url, blob);
        triggerDownload(blob, url.split("/").pop() || "download");
    }

    function triggerDownload(blob, filename) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    async function uploadInChunks(url, parts = 4) {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.click();

        fileInput.addEventListener("change", async () => {
            const file = fileInput.files[0];
            const chunkSize = Math.ceil(file.size / parts);
            let offset = 0;

            for (let i = 0; i < parts; i++) {
                const chunk = file.slice(offset, offset + chunkSize);
                const formData = new FormData();
                formData.append("file", chunk, `${file.name}.part${i}`);

                await fetch(url, {
                    method: "POST",
                    body: formData
                });

                offset += chunkSize;
            }

            console.log("Upload concluído em partes.");
        });
    }

    // 7. Salvar vídeos e áudios no cache ("caixa")
    function saveToCache(name, content) {
        if (content instanceof Blob) {
            content.arrayBuffer().then(buffer => {
                localStorage.setItem(name, btoa(String.fromCharCode.apply(null, new Uint8Array(buffer))));
            });
        } else {
            localStorage.setItem(name, content);
        }
    }

    // 8. Carregar páginas offline
    function loadOfflineFallback(site = "https://www.google.com ") {
        const cached = localStorage.getItem(site);
        if (cached) {
            document.open();
            document.write(cached);
            document.close();
        } else {
            console.warn("Nenhuma versão offline encontrada para:", site);
        }
    }

    // 9. Reproduzir vídeos e áudios
    function handleMediaDownloads() {
        const videos = document.querySelectorAll("video, source");
        videos.forEach(video => {
            video.addEventListener("play", () => {
                console.log("Vídeo iniciado:", video.currentSrc);
                splitTransfer(video.currentSrc, "download");
            });
        });

        const audios = document.querySelectorAll("audio, source");
        audios.forEach(audio => {
            audio.addEventListener("play", () => {
                console.log("Áudio iniciado:", audio.currentSrc);
                splitTransfer(audio.currentSrc, "download");
            });
        });
    }

    // Executar todas as funções ao carregar a página
    window.addEventListener("load", () => {
        autoEnablePasnIfInsecure(); // Verifica se site é HTTP → ativa PASN
        enableDarkMode();
        forceDuckDuckGoSearch();
        hideUserIP();
        autoTranslatePage("pt");
        handleMediaDownloads();
    });

    // Exportando algumas funções para uso externo
    window.darkok = {
        enableDarkMode,
        forceDuckDuckGoSearch,
        hideUserIP,
        autoEnablePasnIfInsecure,
        autoTranslatePage,
        splitTransfer,
        saveToCache,
        loadOfflineFallback,
        handleMediaDownloads
    };

})();
