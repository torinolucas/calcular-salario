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
 * @returns {Object} Objeto com os valores dos descontos
 */
function calcularDescontos(salarioBruto) {
    // ===== CÁLCULO DO INSS =====
    let descontoINSS = 0;
    
    // Faixas progressivas do INSS (2024/2025)
    if (salarioBruto <= 1412.00) {
        descontoINSS = salarioBruto * 0.075; // 7,5%
    } else if (salarioBruto <= 2666.68) {
        descontoINSS = (1412 * 0.075) + ((salarioBruto - 1412) * 0.09); // 9%
    } else if (salarioBruto <= 4000.03) {
        descontoINSS = (1412 * 0.075) + ((2666.68 - 1412) * 0.09) + ((salarioBruto - 2666.68) * 0.12); // 12%
    } else if (salarioBruto <= 7786.02) {
        descontoINSS = (1412 * 0.075) + ((2666.68 - 1412) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((salarioBruto - 4000.03) * 0.14); // 14%
    } else {
        descontoINSS = 908.85; // Teto máximo do INSS
    }
    
    // ===== CÁLCULO DO IRRF =====
    const baseIRRF = salarioBruto - descontoINSS;
    let descontoIRRF = 0;
    
    // Faixas progressivas do IRRF (2024/2025)
    if (baseIRRF <= 2259.20) {
        descontoIRRF = 0; // Isento
    } else if (baseIRRF <= 2826.65) {
        descontoIRRF = (baseIRRF * 0.075) - 169.44; // 7,5%
    } else if (baseIRRF <= 3751.05) {
        descontoIRRF = (baseIRRF * 0.15) - 381.44; // 15%
    } else if (baseIRRF <= 4664.68) {
        descontoIRRF = (baseIRRF * 0.225) - 662.77; // 22,5%
    } else {
        descontoIRRF = (baseIRRF * 0.275) - 896.00; // 27,5%
    }
    
    // Garantir que o IRRF não seja negativo
    if (descontoIRRF < 0) descontoIRRF = 0;
    
    return {
        inss: descontoINSS,
        irrf: descontoIRRF
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
    document.getElementById('formulaValorHora').innerText = `(${dados.salarioBase} + ${dados.bonificacao}) / 200`;
    
    document.getElementById('resHE75').innerText = `R$ ${calculos.totalHE75.toFixed(2)}`;
    document.getElementById('formulaHE75').innerText = `${dados.he75}h × (R$ ${calculos.valorHora.toFixed(3)} × 1.75)`;
    
    document.getElementById('resHE100').innerText = `R$ ${calculos.totalHE100.toFixed(2)}`;
    document.getElementById('formulaHE100').innerText = `${dados.he100}h × (R$ ${calculos.valorHora.toFixed(3)} × 2.00)`;

    document.getElementById('resHENoturna').innerText = `R$ ${calculos.totalHENoturna75.toFixed(2)}`;
    document.getElementById('formulaHENoturna').innerText = `${dados.heNoturna75}h × (H.E. 75% + Adic. Noturno 30%)`;

    document.getElementById('resHENoturna100').innerText = `R$ ${calculos.totalHENoturna100.toFixed(2)}`;
    document.getElementById('formulaHENoturna100').innerText = `${dados.heNoturna100}h × (H.E. 100% + Adic. Noturno 30%)`;

    document.getElementById('resSobreaviso').innerText = `R$ ${calculos.totalSobreaviso.toFixed(2)}`;
    document.getElementById('formulaSobreaviso').innerText = `${dados.sobreaviso}h × (R$ ${calculos.valorHora.toFixed(3)} / 3)`;

    document.getElementById('resDSR').innerText = `R$ ${calculos.dsr.toFixed(2)}`;
    document.getElementById('formulaDSR').innerText = `(H.E.75% + H.E.100% + H.E.Noturna75% + H.E.Noturna100% + Sobreaviso = R$ ${calculos.totalVariaveis.toFixed(2)}) / ${dados.diasUteis} dias úteis × ${dados.diasDescanso} dias descanso`;

    // ===== EXIBIR RESUMO FINANCEIRO =====
    document.getElementById('resBruto').innerText = `R$ ${calculos.salarioBruto.toFixed(2)}`;
    document.getElementById('resINSS').innerText = `R$ ${descontos.inss.toFixed(2)}`;
    document.getElementById('resIRRF').innerText = `R$ ${descontos.irrf.toFixed(2)}`;
    document.getElementById('resLiquido').innerText = `R$ ${salarioLiquido.toFixed(2)}`;
    
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

/**
 * Inicialização quando a página carrega
 */
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar listeners para validação em tempo real, se necessário
    console.log('Calculadora de Salário carregada com sucesso!');
});