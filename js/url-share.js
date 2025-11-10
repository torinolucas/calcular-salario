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

        // Construir uma URL RELATIVA (usar pathname sem query para evitar duplicar '?')
        const pathname = (function(){
            try {
                // window.location.pathname NÃO contém query string; garante caminho relativo correto
                return window.location.pathname || '/';
            } catch (e) {
                return '/';
            }
        })();

        const hash = window.location.hash || '';

        // montar relativa sem repetir '?' (pathname não tem query)
        const novaUrlRelativa = qs ? `${pathname}${qs ? '?' + qs : ''}${hash}` : `${pathname}${hash}`;

        // Tentar atualizar o histórico de forma segura; falhar sem lançar erro se não for permitido
        try {
            history.replaceState(null, '', novaUrlRelativa);
        } catch (e) {
            console.warn('Não foi possível atualizar history.replaceState (origem inválida).', e);
            // não abortamos — só não atualizamos o histórico
        }

        // Construir a URL completa a partir de origin + pathname (sem query)
        const baseAtual = (function(){
            try {
                return (window.location.origin || window.location.protocol + '//' + window.location.host) + pathname + hash;
            } catch (e) {
                return pathname;
            }
        })();

        const shareUrlCompleta = qs ? `${baseAtual}${baseAtual.includes('?') ? '&' : '?'}${qs}` : baseAtual;

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
