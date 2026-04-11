/* ========================================
   CALCULADORA DE SALÁRIO - JAVASCRIPT
   ======================================== */

/**
 * Função principal para calcular o salário líquido
 * com todos os adicionais e descontos
 */
function calcularSalario() {
    // ===== 1. OBTER VALORES DOS INPUTS =====
    const dadosEntrada = obterDadosEntrada();
    
    // ===== 2. CALCULAR VALORES =====
    const calculos = calcularVencimentos(dadosEntrada);
    
    // ===== 3. CALCULAR DESCONTOS =====
    const descontos = calcularDescontos(calculos.salarioBruto);
    
    // ===== 4. CALCULAR SALÁRIO LÍQUIDO =====
    const salarioLiquido = calculos.salarioBruto - descontos.inss - descontos.irrf;
    
    // ===== 5. EXIBIR RESULTADOS =====
    exibirResultados(dadosEntrada, calculos, descontos, salarioLiquido);
}

/**
 * Obtém todos os valores dos inputs do formulário
 * @returns {Object} Objeto com todos os valores de entrada
 */
function obterDadosEntrada() {
    return {
        salarioBase: parseFloat(document.getElementById('salarioBase').value) || 0,
        bonificacao: parseFloat(document.getElementById('bonificacao').value) || 0,
        he75: parseFloat(document.getElementById('he75').value) || 0,
        he100: parseFloat(document.getElementById('he100').value) || 0,
        heNoturna75: parseFloat(document.getElementById('heNoturna75').value) || 0,
        heNoturna100: parseFloat(document.getElementById('heNoturna100').value) || 0,
        sobreaviso: parseFloat(document.getElementById('sobreaviso').value) || 0,
        diasUteis: parseFloat(document.getElementById('diasUteis').value) || 22,
        diasDescanso: parseFloat(document.getElementById('diasDescanso').value) || 5
    };
}

/**
 * Calcula todos os vencimentos e valores brutos
 * @param {Object} dados - Dados de entrada do formulário
 * @returns {Object} Objeto com todos os cálculos de vencimentos
 */
function calcularVencimentos(dados) {
    // Função auxiliar de arredondamento para 2 casas decimais
    const r2 = (v) => Math.round(v * 100) / 100;

    // Cálculo do valor da hora: (Base + Bônus) / 200, arredondado para 2 casas
    const valorHora = r2((dados.salarioBase + dados.bonificacao) / 200);
    
    // Cálculo das horas extras
    const totalHE75 = r2(dados.he75 * (valorHora * 1.75));
    const totalHE100 = r2(dados.he100 * (valorHora * 2.00));
    
    // Cálculo das horas extras noturnas (75% + adicional noturno 30%)
    const totalHENoturna75 = r2(dados.heNoturna75 * ((valorHora * 1.75) + (valorHora * 0.30)));
    
    // Cálculo das horas extras noturnas (100% + adicional noturno 30%)
    const totalHENoturna100 = r2(dados.heNoturna100 * ((valorHora * 2.00) + (valorHora * 0.30)));
    
    // Cálculo do sobreaviso (valor da hora dividido por 3)
    const totalSobreaviso = r2(dados.sobreaviso * (valorHora / 3));
    
    // Total de valores variáveis
    const totalVariaveis = r2(totalHE75 + totalHE100 + totalHENoturna75 + totalHENoturna100 + totalSobreaviso);
    
    // Cálculo do DSR (Descanso Semanal Remunerado) — arredondado para 2 casas
    const dsr = dados.diasUteis > 0 ? r2((totalVariaveis / dados.diasUteis) * dados.diasDescanso) : 0;
    
    // Salário bruto total — arredondado para 2 casas
    const salarioBruto = r2(dados.salarioBase + dados.bonificacao + totalVariaveis + dsr);
    
    return {
        valorHora,
        totalHE75,
        totalHE100,
        totalHENoturna75,
        totalHENoturna100,
        totalSobreaviso,
        totalVariaveis,
        dsr,
        salarioBruto
    };
}

/**
 * Calcula os descontos de INSS e IRRF
 * @param {number} salarioBruto - Valor do salário bruto
 * @returns {Object} Objeto com os valores dos descontos e fórmulas explicativas
 */
function calcularDescontos(salarioBruto) {
    // ===== CÁLCULO DO INSS (Portaria MPS/MF Nº 13 — Janeiro 2026) =====
    // Cálculo progressivo por faixas
    const TETO_INSS = 8475.55;
    const salarioINSS = Math.min(salarioBruto, TETO_INSS);

    let descontoINSS = 0;
    let formulaINSSTexto = '';
    const partesFormula = [];

    // 1ª Faixa: até R$ 1.621,00 → 7,5%
    const faixa1 = Math.min(salarioINSS, 1621.00);
    const desc1 = faixa1 * 0.075;
    descontoINSS += desc1;
    if (faixa1 > 0) partesFormula.push(`${faixa1.toFixed(2)} × 7,5% = ${desc1.toFixed(2)}`);

    // 2ª Faixa: de R$ 1.621,01 até R$ 2.902,84 → 9%
    if (salarioINSS > 1621.00) {
        const faixa2 = Math.min(salarioINSS, 2902.84) - 1621.00;
        const desc2 = faixa2 * 0.09;
        descontoINSS += desc2;
        partesFormula.push(`${faixa2.toFixed(2)} × 9% = ${desc2.toFixed(2)}`);
    }

    // 3ª Faixa: de R$ 2.902,85 até R$ 4.354,27 → 12%
    if (salarioINSS > 2902.84) {
        const faixa3 = Math.min(salarioINSS, 4354.27) - 2902.84;
        const desc3 = faixa3 * 0.12;
        descontoINSS += desc3;
        partesFormula.push(`${faixa3.toFixed(2)} × 12% = ${desc3.toFixed(2)}`);
    }

    // 4ª Faixa: de R$ 4.354,28 até R$ 8.475,55 (Teto) → 14%
    if (salarioINSS > 4354.27) {
        const faixa4 = Math.min(salarioINSS, TETO_INSS) - 4354.27;
        const desc4 = faixa4 * 0.14;
        descontoINSS += desc4;
        partesFormula.push(`${faixa4.toFixed(2)} × 14% = ${desc4.toFixed(2)}`);
    }

    // Arredondar para 2 casas decimais
    descontoINSS = Math.round(descontoINSS * 100) / 100;

    // Forçar valor fixo oficial da Portaria para salários acima do teto
    if (salarioBruto > TETO_INSS) {
        descontoINSS = 988.07;
        formulaINSSTexto = `Teto máximo INSS: R$ 988,07 (salário acima de R$ ${TETO_INSS.toFixed(2)})`;
    } else {
        formulaINSSTexto = `${partesFormula.join(' + ')} = R$ ${descontoINSS.toFixed(2)}`;
    }

    // ===== CÁLCULO DO IRRF (Reforma Tributária 2026) =====
    // Base de cálculo: Salário Bruto arredondado - INSS arredondado
    const baseIRRF = Math.round((salarioBruto - descontoINSS) * 100) / 100;

    let descontoIRRF = 0;
    let formulaIRRFTexto = '';

    // 1) Isenção total: até R$ 5.000,00
    if (baseIRRF <= 5000.00) {
        descontoIRRF = 0;
        formulaIRRFTexto = `Base IRRF: ${baseIRRF.toFixed(2)} — Isento (até R$ 5.000,00)`;

    // 2) Faixa de redução gradual: R$ 5.000,01 a R$ 7.350,00
    } else if (baseIRRF <= 7350.00) {
        // Calcular imposto pela tabela progressiva tradicional
        const impostoTabela = calcularImpostoTabela(baseIRRF);
        // Redutor: 978,62 - (0,133145 × Base_IRRF)
        const redutor = Math.round((978.62 - (0.133145 * baseIRRF)) * 100) / 100;
        descontoIRRF = impostoTabela - (redutor > 0 ? redutor : 0);
        if (descontoIRRF < 0) descontoIRRF = 0;
        descontoIRRF = Math.round(descontoIRRF * 100) / 100;
        formulaIRRFTexto = `Base IRRF: ${baseIRRF.toFixed(2)} — Tabela: ${impostoTabela.toFixed(2)} - Redutor: ${(redutor > 0 ? redutor : 0).toFixed(2)} = ${descontoIRRF.toFixed(2)}`;

    // 3) Acima de R$ 7.350,00: tabela tradicional sem redutor
    } else {
        descontoIRRF = calcularImpostoTabela(baseIRRF);
        descontoIRRF = Math.round(descontoIRRF * 100) / 100;
        const faixaInfo = obterFaixaIRRF(baseIRRF);
        formulaIRRFTexto = `Base IRRF: ${baseIRRF.toFixed(2)} × ${faixaInfo.aliquotaTexto} - ${faixaInfo.deducaoTexto} = ${descontoIRRF.toFixed(2)}`;
    }

    // Garantir que o IRRF não seja negativo
    if (descontoIRRF < 0) descontoIRRF = 0;

    return {
        inss: descontoINSS,
        irrf: descontoIRRF,
        formulaINSS: formulaINSSTexto,
        formulaIRRF: formulaIRRFTexto
    };
}

/**
 * Calcula o imposto pela tabela progressiva tradicional do IRRF
 * @param {number} base - Base de cálculo do IRRF
 * @returns {number} Valor do imposto
 */
function calcularImpostoTabela(base) {
    if (base <= 2428.80) return 0;
    if (base <= 2826.65) return (base * 0.075) - 182.16;
    if (base <= 3751.05) return (base * 0.15) - 394.16;
    if (base <= 4664.68) return (base * 0.225) - 675.49;
    return (base * 0.275) - 908.73;
}

/**
 * Retorna info da faixa do IRRF para exibição na fórmula
 * @param {number} base - Base de cálculo
 * @returns {Object} { aliquotaTexto, deducaoTexto }
 */
function obterFaixaIRRF(base) {
    if (base <= 2428.80) return { aliquotaTexto: '0%', deducaoTexto: '0,00' };
    if (base <= 2826.65) return { aliquotaTexto: '7,5%', deducaoTexto: '182,16' };
    if (base <= 3751.05) return { aliquotaTexto: '15%', deducaoTexto: '394,16' };
    if (base <= 4664.68) return { aliquotaTexto: '22,5%', deducaoTexto: '675,49' };
    return { aliquotaTexto: '27,5%', deducaoTexto: '908,73' };
}

/**
 * Exibe todos os resultados na interface
 * @param {Object} dados - Dados de entrada
 * @param {Object} calculos - Resultados dos cálculos
 * @param {Object} descontos - Valores dos descontos
 * @param {number} salarioLiquido - Valor do salário líquido final
 */
function exibirResultados(dados, calculos, descontos, salarioLiquido) {
    // ===== EXIBIR DETALHES DOS GANHOS =====
    document.getElementById('resValorHora').innerText = `R$ ${calculos.valorHora.toFixed(2)}`;
    document.getElementById('formulaValorHora').innerHTML =
        `(<strong>${formatarMoeda(dados.salarioBase)} + ${formatarMoeda(dados.bonificacao)}</strong>) / 200`;
    
    document.getElementById('resHE75').innerText = `R$ ${calculos.totalHE75.toFixed(2)}`;
    document.getElementById('formulaHE75').innerHTML = `<strong>${dados.he75}h</strong> × (R$ ${calculos.valorHora.toFixed(2)} × 1.75)`;
    
    document.getElementById('resHE100').innerText = `R$ ${calculos.totalHE100.toFixed(2)}`;
    document.getElementById('formulaHE100').innerHTML = `<strong>${dados.he100}h</strong> × (R$ ${calculos.valorHora.toFixed(2)} × 2.00)`;

    document.getElementById('resHENoturna').innerText = `R$ ${calculos.totalHENoturna75.toFixed(2)}`;
    document.getElementById('formulaHENoturna').innerHTML = `<strong>${dados.heNoturna75}h</strong> × (H.E. 75% + Adic. Noturno 30%)`;

    document.getElementById('resHENoturna100').innerText = `R$ ${calculos.totalHENoturna100.toFixed(2)}`;
    document.getElementById('formulaHENoturna100').innerHTML = `<strong>${dados.heNoturna100}h</strong> × (H.E. 100% + Adic. Noturno 30%)`;

    document.getElementById('resSobreaviso').innerText = `R$ ${calculos.totalSobreaviso.toFixed(2)}`;
    document.getElementById('formulaSobreaviso').innerHTML = `<strong>${dados.sobreaviso}h</strong> × (R$ ${calculos.valorHora.toFixed(2)} / 3)`;

    document.getElementById('resDSR').innerText = `R$ ${calculos.dsr.toFixed(2)}`;
    document.getElementById('formulaDSR').innerHTML = `(Todas as H.E. + Sobreaviso = R$ ${calculos.totalVariaveis.toFixed(2)}) / <strong>${dados.diasUteis}</strong> dias úteis × <strong>${dados.diasDescanso}</strong> dias descanso`;

    // ===== EXIBIR RESUMO FINANCEIRO =====
    document.getElementById('resBruto').innerText = `R$ ${calculos.salarioBruto.toFixed(2)}`;
    document.getElementById('resINSS').innerText = `R$ ${descontos.inss.toFixed(2)}`;
    document.getElementById('resIRRF').innerText = `R$ ${descontos.irrf.toFixed(2)}`;
    document.getElementById('resLiquido').innerText = `R$ ${salarioLiquido.toFixed(2)}`;
    
    // Usar as fórmulas calculadas na função calcularDescontos
    document.getElementById('formulaINSS').innerText = descontos.formulaINSS;
    document.getElementById('formulaIRRF').innerText = descontos.formulaIRRF;
    
    // ===== MOSTRAR A SEÇÃO DE RESULTADOS =====
    document.getElementById('resultados').style.display = 'block';
}

/**
 * Utilitário para formatação de moeda brasileira
 * @param {number} valor - Valor numérico
 * @returns {string} Valor formatado em moeda brasileira
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA AO CARREGAR A PÁGINA =====

/**
 * Atualiza dias úteis e descanso com base no mês/ano selecionado,
 * considerando feriados nacionais.
 */
function atualizarDiasPorMesAno() {
    var mesEl = document.getElementById('mesRef');
    var anoEl = document.getElementById('anoRef');
    if (!mesEl || !anoEl) return;

    var mes = parseInt(mesEl.value, 10);
    var ano = parseInt(anoEl.value, 10);
    if (!mes || !ano || ano < 2020 || ano > 2040) return;

    var mesesPt = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    if (window.calcHolidays && typeof window.calcHolidays.calcularDiasUteisMes === 'function') {
        var res = window.calcHolidays.calcularDiasUteisMes(mes, ano);

        var diasUteisInput = document.getElementById('diasUteis');
        var diasDescansoInput = document.getElementById('diasDescanso');
        if (diasUteisInput) diasUteisInput.value = res.diasUteis;
        if (diasDescansoInput) diasDescansoInput.value = res.descansoTotal;

        // Atualizar nota informativa
        var mesAtualNameEl = document.getElementById('mesAtualName');
        var mesAtualNoteEl = document.getElementById('mesAtualNote');
        if (mesAtualNameEl) {
            var texto = mesesPt[mes - 1] + ' ' + ano + ': ' +
                res.diasUteis + ' dias úteis, ' +
                res.domingos + ' domingos';
            if (res.feriadosEmDiaUtil > 0) {
                texto += ', ' + res.feriadosEmDiaUtil + ' feriado' + (res.feriadosEmDiaUtil > 1 ? 's' : '') + ' em dia útil';
            }
            mesAtualNameEl.innerHTML = texto;
        }
        if (mesAtualNoteEl) mesAtualNoteEl.style.display = 'block';

        // Listar feriados do mês
        var feriadosListaEl = document.getElementById('feriadosLista');
        if (feriadosListaEl) {
            if (res.feriadosNoMes && res.feriadosNoMes.length > 0) {
                var nomes = [];
                for (var i = 0; i < res.feriadosNoMes.length; i++) {
                    var f = res.feriadosNoMes[i];
                    var dia = String(f.data.getDate()).padStart(2, '0');
                    nomes.push(dia + ' — ' + f.nome);
                }
                feriadosListaEl.innerHTML = '📅 Feriados: ' + nomes.join(' · ');
                feriadosListaEl.style.display = 'block';
            } else {
                feriadosListaEl.innerHTML = 'Nenhum feriado nacional neste mês.';
                feriadosListaEl.style.display = 'block';
            }
        }
    }

    // Atualizar URL compartilhável se disponível
    if (window.urlShare && typeof window.urlShare.atualizarUrlCompartilhavel === 'function') {
        window.urlShare.atualizarUrlCompartilhavel();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var mesAtual = new Date().getMonth() + 1;
    var anoAtual = new Date().getFullYear();

    // Verificar parâmetros da URL
    var urlParams = new URLSearchParams(window.location.search);
    var hasDiasUteisParam = urlParams.has('diasUteis');
    var hasDiasDescansoParam = urlParams.has('diasDescanso');

    // Preencher seletores de mês/ano
    var mesRefEl = document.getElementById('mesRef');
    var anoRefEl = document.getElementById('anoRef');
    if (mesRefEl) mesRefEl.value = urlParams.has('mesRef') ? urlParams.get('mesRef') : mesAtual;
    if (anoRefEl) anoRefEl.value = urlParams.has('anoRef') ? urlParams.get('anoRef') : anoAtual;

    // Calcular dias úteis iniciais (se URL não forçou valores)
    if (!hasDiasUteisParam || !hasDiasDescansoParam) {
        atualizarDiasPorMesAno();
    } else {
        // URL tem prioridade — preencher via prefill e esconder nota
        var mesAtualNoteEl = document.getElementById('mesAtualNote');
        if (mesAtualNoteEl) mesAtualNoteEl.style.display = 'none';
        var feriadosListaEl = document.getElementById('feriadosLista');
        if (feriadosListaEl) feriadosListaEl.style.display = 'none';
    }

    // Listeners para recalcular ao trocar mês/ano
    if (mesRefEl) mesRefEl.addEventListener('change', atualizarDiasPorMesAno);
    if (anoRefEl) anoRefEl.addEventListener('change', atualizarDiasPorMesAno);
    if (anoRefEl) anoRefEl.addEventListener('input', atualizarDiasPorMesAno);

    // Delegar inicialização da URL compartilhável
    if (window.urlShare && typeof window.urlShare.init === 'function') {
        try { window.urlShare.init(); } catch (e) { console.warn('Erro ao iniciar urlShare:', e); }
    }

    console.log('Calculadora de Salário carregada com sucesso!');
});

(function prefillFromUrl(){
    const map = {
        salarioBase: 'salarioBase',
        bonificacao: 'bonificacao', // select
        he75: 'he75',
        he100: 'he100',
        heNoturna75: 'heNoturna75',
        heNoturna100: 'heNoturna100',
        sobreaviso: 'sobreaviso',
        mesRef: 'mesRef',
        anoRef: 'anoRef',
        diasUteis: 'diasUteis',
        diasDescanso: 'diasDescanso'
    };

    const params = new URLSearchParams(window.location.search);
    let filled = false;

    for (const [param, id] of Object.entries(map)) {
        if (!params.has(param)) continue;
        const el = document.getElementById(id);
        if (!el) continue;
        el.value = params.get(param);
        filled = true;
    }

    // Se quiser executar o cálculo automaticamente, adicione &run=1 na URL
    if (filled && params.get('run') === '1' && typeof calcularSalario === 'function') {
        setTimeout(() => calcularSalario(), 50);
    }
})();