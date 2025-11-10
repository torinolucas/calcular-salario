(function(){
    // Campos que serão transformados em query string
    const _shareableFields = [
        'salarioBase',
        'bonificacao',
        'he75',
        'he100',
        'heNoturna75',
        'heNoturna100',
        'sobreaviso',
        'diasUteis',
        'diasDescanso'
    ];

    function debounce(fn, wait = 300) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    }

    function atualizarUrlCompartilhavel() {
        const params = new URLSearchParams();

        for (const id of _shareableFields) {
            const el = document.getElementById(id);
            if (!el) continue;
            const val = String(el.value || '').trim();
            if (val !== '') params.set(id, val);
        }

        const qs = params.toString();

        // Construir uma URL RELATIVA (apenas o nome do arquivo) para evitar problemas de origem
        const fileName = (function(){
            try {
                const p = window.location.pathname || '';
                const name = p.split('/').pop();
                return name || window.location.href;
            } catch (e) {
                return window.location.href;
            }
        })();

        const novaUrlRelativa = qs ? `${fileName}?${qs}` : fileName;

        // Tentar atualizar o histórico de forma segura; falhar sem lançar erro se não for permitido
        try {
            history.replaceState(null, '', novaUrlRelativa);
        } catch (e) {
            console.warn('Não foi possível atualizar history.replaceState (origem inválida).', e);
            // não abortamos — só não atualizamos o histórico
        }

        // Atualizar campo de compartilhamento com a URL completa baseada na URL atual do documento
        const baseAtual = (function(){
            try {
                // usa a parte atual sem query string
                return window.location.href.split('?')[0];
            } catch (e) {
                return fileName;
            }
        })();

        const shareUrlCompleta = qs ? `${baseAtual}?${qs}` : baseAtual;

        const shareEl = document.getElementById('shareUrl');
        if (shareEl) shareEl.value = shareUrlCompleta;
    }

    // init: registra listeners e atualiza a URL inicialmente
    function init() {
        if (window.urlShare && window.urlShare._inited) return;
        // marcar como inicializado
        window.urlShare = window.urlShare || {};
        window.urlShare._inited = true;

        const debouncedUpdate = debounce(atualizarUrlCompartilhavel, 300);

        for (const id of _shareableFields) {
            const el = document.getElementById(id);
            if (!el) continue;
            el.addEventListener('input', debouncedUpdate);
            el.addEventListener('change', debouncedUpdate);
        }

        // Atualiza a URL imediatamente com os valores atuais (útil para defaults)
        atualizarUrlCompartilhavel();
    }

    // Expor o módulo
    window.urlShare = window.urlShare || {};
    window.urlShare.init = init;
    window.urlShare.atualizarUrlCompartilhavel = atualizarUrlCompartilhavel;

    // Auto-inicializa caso carregado depois do calculator.js
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // já carregado
        setTimeout(init, 0);
    }
})();
