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

    // ===== CÁLCULO DO IRRF =====
    // Base de cálculo: Salário Bruto arredondado - INSS arredondado, arredondado para 2 casas
    const baseIRRF = Math.round((salarioBruto - descontoINSS) * 100) / 100;

    let descontoIRRF = 0;
    let formulaIRRFTexto = '';

    // Faixas progressivas do IRRF (maio 2025)
    if (baseIRRF <= 2428.80) {
        descontoIRRF = 0; // Isento
        formulaIRRFTexto = `Base Cálc. IRRF: ${baseIRRF.toFixed(2)} - Isento de IRRF`;
    } else if (baseIRRF <= 2826.65) {
        descontoIRRF = (baseIRRF * 0.075) - 182.16; // 7,5%
        formulaIRRFTexto = `Base Cálc. IRRF: ${baseIRRF.toFixed(2)} × 7,5% - 182,16 = ${descontoIRRF.toFixed(2)}`;
    } else if (baseIRRF <= 3751.05) {
        descontoIRRF = (baseIRRF * 0.15) - 394.16; // 15%
        formulaIRRFTexto = `Base Cálc. IRRF: ${baseIRRF.toFixed(2)} × 15% - 394,16 = ${descontoIRRF.toFixed(2)}`;
    } else if (baseIRRF <= 4664.68) {
        descontoIRRF = (baseIRRF * 0.225) - 675.49; // 22,5%
        formulaIRRFTexto = `Base Cálc. IRRF: ${baseIRRF.toFixed(2)} × 22,5% - 675,49 = ${descontoIRRF.toFixed(2)}`;
    } else {
        descontoIRRF = (baseIRRF * 0.275) - 908.73; // 27,5%
        formulaIRRFTexto = `Base Cálc. IRRF: ${baseIRRF.toFixed(2)} × 27,5% - 908,73 = ${descontoIRRF.toFixed(2)}`;
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

document.addEventListener('DOMContentLoaded', function() {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();

    // verificar parâmetros da URL — se houver, eles têm prioridade
    const urlParams = new URLSearchParams(window.location.search);
    const hasDiasUteisParam = urlParams.has('diasUteis');
    const hasDiasDescansoParam = urlParams.has('diasDescanso');

    // preencher nome do mês em pt-BR no pequeno texto da UI (se presente)
    const mesesPt = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const nomeMes = mesesPt[(mesAtual - 1) % 12] || '';
    const mesAtualNameEl = document.getElementById('mesAtualName');
    const mesAtualNoteEl = document.getElementById('mesAtualNote');

    // Se a URL especificou diasUteis e diasDescanso, esconder a mensagem informativa
    if (hasDiasUteisParam && hasDiasDescansoParam) {
        if (mesAtualNoteEl) mesAtualNoteEl.style.display = 'none';
        // ainda podemos preencher os campos via prefillFromUrl (feito abaixo)
    } else {
        // mostrar e preencher o nome do mês
        if (mesAtualNoteEl) mesAtualNoteEl.style.display = 'block';
        if (mesAtualNameEl) mesAtualNameEl.textContent = `${nomeMes} ${anoAtual}`;
    }

    if (window.calcHolidays && typeof window.calcHolidays.calcularDiasUteisMes === 'function') {
        const res = window.calcHolidays.calcularDiasUteisMes(mesAtual, anoAtual);
        const diasUteisInput = document.getElementById('diasUteis');
        const diasDescansoInput = document.getElementById('diasDescanso');

        // se URL forneceu o valor, respeitar a URL (prioridade)
        if (diasUteisInput) {
            if (hasDiasUteisParam) {
                diasUteisInput.value = urlParams.get('diasUteis');
            } else {
                diasUteisInput.value = res.diasUteis;
            }
        }

        if (diasDescansoInput) {
            if (hasDiasDescansoParam) {
                diasDescansoInput.value = urlParams.get('diasDescanso');
            } else {
                diasDescansoInput.value = res.domingos;
            }
        }
    } else {
        console.warn('calc-holiday-sunday.js não carregado: dias úteis não preenchidos automaticamente.');
    }

    // Delegar inicialização da URL compartilhável para o módulo url-share (se presente)
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
        diasUteis: 'diasUteis',       // ADICIONADO — permitir preencher via URL
        diasDescanso: 'diasDescanso'  // ADICIONADO — permitir preencher via URL
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