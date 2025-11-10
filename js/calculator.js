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
    // Cálculo do valor da hora: (Base + Bônus) / 200
    const valorHora = (dados.salarioBase + dados.bonificacao) / 200;
    
    // Cálculo das horas extras
    const totalHE75 = dados.he75 * (valorHora * 1.75);
    const totalHE100 = dados.he100 * (valorHora * 2.00);
    
    // Cálculo das horas extras noturnas (75% + adicional noturno 30%)
    const totalHENoturna75 = dados.heNoturna75 * ((valorHora * 1.75) + (valorHora * 0.30));
    
    // Cálculo das horas extras noturnas (100% + adicional noturno 30%)
    const totalHENoturna100 = dados.heNoturna100 * ((valorHora * 2.00) + (valorHora * 0.30));
    
    // Cálculo do sobreaviso (valor da hora dividido por 3)
    const totalSobreaviso = dados.sobreaviso * (valorHora / 3);
    
    // Total de valores variáveis
    const totalVariaveis = totalHE75 + totalHE100 + totalHENoturna75 + totalHENoturna100 + totalSobreaviso;
    
    // Cálculo do DSR (Descanso Semanal Remunerado)
    const dsr = dados.diasUteis > 0 ? (totalVariaveis / dados.diasUteis) * dados.diasDescanso : 0;
    
    // Salário bruto total
    const salarioBruto = dados.salarioBase + dados.bonificacao + totalVariaveis + dsr;
    
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
    // ===== CÁLCULO DO INSS =====
    let descontoINSS = 0;
    let formulaINSSTexto = '';
    
    // Tabela INSS 2025 (com dedução): alíquotas e faixas de contribuição
    if (salarioBruto <= 1518.00) {
        // 1ª Faixa
        descontoINSS = salarioBruto * 0.075;
        formulaINSSTexto = `${salarioBruto.toFixed(2)} × 7,5% = ${descontoINSS.toFixed(2)}`;
    } else if (salarioBruto <= 2793.88) {
        // 2ª Faixa
        descontoINSS = (salarioBruto * 0.09) - 22.77;
        formulaINSSTexto = `(${salarioBruto.toFixed(2)} × 9%) - 22,77 = ${descontoINSS.toFixed(2)}`;
    } else if (salarioBruto <= 4190.84) {
        // 3ª Faixa
        descontoINSS = (salarioBruto * 0.12) - 106.59;
        formulaINSSTexto = `(${salarioBruto.toFixed(2)} × 12%) - 106,59 = ${descontoINSS.toFixed(2)}`;
    } else if (salarioBruto <= 8150.50) {
        // 4ª Faixa (até o teto)
        descontoINSS = (salarioBruto * 0.14) - 190.41;
        formulaINSSTexto = `(${salarioBruto.toFixed(2)} × 14%) - 190,41 = ${descontoINSS.toFixed(2)}`;
    } else {
        // Acima do teto, o desconto é fixo
        descontoINSS = 950.66; // Valor do desconto sobre o teto: (8150.50 * 0.14) - 190.41
        formulaINSSTexto = `Teto máximo INSS: R$ 950,66 (salário acima de R$ 8.150,50)`;
    }
    
    // ===== CÁLCULO DO IRRF =====
    // A partir de maio de 2025, houve atualização: a primeira faixa passou a R$ 2.428,80, e o desconto simplificado foi ampliado para R$ 607,20. Na prática, isso garantiu a isenção de quem recebe até R$ 3.036,00, o equivalente a dois salários mínimos.
    const baseIRRF = Math.min(salarioBruto - descontoINSS, salarioBruto - 607.20);
    
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
    document.getElementById('resValorHora').innerText = `R$ ${calculos.valorHora.toFixed(3)}`;
    document.getElementById('formulaValorHora').innerHTML =
        `(<strong>${formatarMoeda(dados.salarioBase)} + ${formatarMoeda(dados.bonificacao)}</strong>) / 200`;
    
    document.getElementById('resHE75').innerText = `R$ ${calculos.totalHE75.toFixed(2)}`;
    document.getElementById('formulaHE75').innerHTML = `<strong>${dados.he75}h</strong> × (R$ ${calculos.valorHora.toFixed(3)} × 1.75)`;
    
    document.getElementById('resHE100').innerText = `R$ ${calculos.totalHE100.toFixed(2)}`;
    document.getElementById('formulaHE100').innerHTML = `<strong>${dados.he100}h</strong> × (R$ ${calculos.valorHora.toFixed(3)} × 2.00)`;

    document.getElementById('resHENoturna').innerText = `R$ ${calculos.totalHENoturna75.toFixed(2)}`;
    document.getElementById('formulaHENoturna').innerHTML = `<strong>${dados.heNoturna75}h</strong> × (H.E. 75% + Adic. Noturno 30%)`;

    document.getElementById('resHENoturna100').innerText = `R$ ${calculos.totalHENoturna100.toFixed(2)}`;
    document.getElementById('formulaHENoturna100').innerHTML = `<strong>${dados.heNoturna100}h</strong> × (H.E. 100% + Adic. Noturno 30%)`;

    document.getElementById('resSobreaviso').innerText = `R$ ${calculos.totalSobreaviso.toFixed(2)}`;
    document.getElementById('formulaSobreaviso').innerHTML = `<strong>${dados.sobreaviso}h</strong> × (R$ ${calculos.valorHora.toFixed(3)} / 3)`;

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

    if (window.calcHolidays && typeof window.calcHolidays.calcularDiasUteisMes === 'function') {
        const res = window.calcHolidays.calcularDiasUteisMes(mesAtual, anoAtual);
        const diasUteisInput = document.getElementById('diasUteis');
        const diasDescansoInput = document.getElementById('diasDescanso');
        if (diasUteisInput) diasUteisInput.value = res.diasUteis;
        if (diasDescansoInput) diasDescansoInput.value = res.domingos;
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
        sobreaviso: 'sobreaviso'
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