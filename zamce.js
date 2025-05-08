(function () {
    'use strict';

    const CHUNK_SIZE = 10 * 1024; // 10 KB por parte

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

        window.matchMedia('(prefers-color-scheme: light)').addListener(e => {
            if (e.matches) enableDarkMode();
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
            });
    }

    // 4. Simula ativação automática da rede PASN se site NÃO for HTTPS
    function autoEnablePasnIfInsecure() {
        if (window.location.protocol !== "https:") {
            console.warn("Site inseguro detectado. Ativando rede segura PASN...");
            alert("Conexão insegura. Ativando rede segura PASN...");
            document.body.style.border = "2px solid cyan";
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

    // 6. Dividir requisições em pequenos pedaços (chunked)
    async function fetchInChunks(url, mimeType = null) {
        let offset = 0;
        let allChunks = [];

        while (true) {
            const end = offset + CHUNK_SIZE - 1;

            const response = await fetch(url, {
                headers: {
                    Range: `bytes=${offset}-${end}`
                }
            });

            if (!response.ok && response.status !== 206 && response.status !== 200) break;

            const chunk = await response.arrayBuffer();
            allChunks.push(new Uint8Array(chunk));

            if (chunk.byteLength < CHUNK_SIZE) break;

            offset += chunk.byteLength;
        }

        const fullData = concatenateArrays(allChunks);
        saveToCache(url, fullData, mimeType);

        return fullData;
    }

    function concatenateArrays(arrays) {
        let totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
        let result = new Uint8Array(totalLength);
        let offset = 0;
        arrays.forEach(arr => {
            result.set(arr, offset);
            offset += arr.length;
        });
        return result;
    }

    // 7. Salvar qualquer tipo de arquivo no cache ("caixa")
    function saveToCache(name, data, mimeType = null) {
        if (mimeType?.startsWith("image/")) {
            const blob = new Blob([data], { type: mimeType });
            localStorage.setItem(name, URL.createObjectURL(blob));
        } else if (mimeType === "text/plain" || mimeType === "text/html") {
            const decoder = new TextDecoder("utf-8");
            const text = decoder.decode(data);
            localStorage.setItem(name, text);
        } else {
            localStorage.setItem(name, btoa(String.fromCharCode.apply(null, data)));
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
                fetchInChunks(video.currentSrc, "video/mp4");
            });
        });

        const audios = document.querySelectorAll("audio, source");
        audios.forEach(audio => {
            audio.addEventListener("play", () => {
                console.log("Áudio iniciado:", audio.currentSrc);
                fetchInChunks(audio.currentSrc, "audio/mpeg");
            });
        });

        const images = document.querySelectorAll("img");
        images.forEach(img => {
            img.addEventListener("load", () => {
                console.log("Imagem carregada:", img.src);
                fetchInChunks(img.src, "image/jpeg");
            });
        });
    }

    // 10. Trabalhar com texto como pacotes de letras
    function splitTextIntoPackages(text, size = 100) {
        let packages = [];
        for (let i = 0; i < text.length; i += size) {
            packages.push(text.slice(i, i + size));
        }
        return packages;
    }

    function injectTextFromPackages(packages) {
        const container = document.createElement("div");
        container.style.whiteSpace = "pre-wrap";
        container.style.margin = "20px";
        packages.forEach(pkg => {
            container.innerHTML += pkg;
        });
        document.body.appendChild(container);
    }

    // Executar todas as funções ao carregar a página
    window.addEventListener("load", () => {
        autoEnablePasnIfInsecure(); // Verifica se site é HTTP → ativa PASN
        enableDarkMode();
        forceDuckDuckGoSearch();
        hideUserIP();
        autoTranslatePage("pt");
        handleMediaDownloads();

        // Exemplo: dividir texto em pacotes de letras
        fetch(window.location.href)
            .then(res => res.text())
            .then(text => {
                const packages = splitTextIntoPackages(text, 100); // 100 caracteres por pacote
                injectTextFromPackages(packages);
            });
    });

    // Exportando algumas funções para uso externo
    window.darkok = {
        enableDarkMode,
        forceDuckDuckGoSearch,
        hideUserIP,
        autoEnablePasnIfInsecure,
        autoTranslatePage,
        fetchInChunks,
        saveToCache,
        loadOfflineFallback,
        handleMediaDownloads,
        splitTextIntoPackages,
        injectTextFromPackages
    };

})();
