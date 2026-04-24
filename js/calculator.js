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
    if (base <= 2428.80) return { aliquota: 0, aliquotaTexto: '0%', deducao: 0, deducaoTexto: '0,00' };
    if (base <= 2826.65) return { aliquota: 0.075, aliquotaTexto: '7,5%', deducao: 182.16, deducaoTexto: '182,16' };
    if (base <= 3751.05) return { aliquota: 0.15, aliquotaTexto: '15%', deducao: 394.16, deducaoTexto: '394,16' };
    if (base <= 4664.68) return { aliquota: 0.225, aliquotaTexto: '22,5%', deducao: 675.49, deducaoTexto: '675,49' };
    return { aliquota: 0.275, aliquotaTexto: '27,5%', deducao: 908.73, deducaoTexto: '908,73' };
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
    document.getElementById('resValorHora').innerText = formatarMoeda(calculos.valorHora);
    document.getElementById('formulaValorHora').innerHTML =
        `(${formatarMoeda(dados.salarioBase)} + ${formatarMoeda(dados.bonificacao)}) / 200`;

    document.getElementById('resHE75').innerText = formatarMoeda(calculos.totalHE75);
    document.getElementById('refHE75').innerText = formatarHoras(dados.he75);
    document.getElementById('formulaHE75').innerHTML = `${dados.he75}h × (${formatarMoeda(calculos.valorHora)} × 1.75)`;

    document.getElementById('resHE100').innerText = formatarMoeda(calculos.totalHE100);
    document.getElementById('refHE100').innerText = formatarHoras(dados.he100);
    document.getElementById('formulaHE100').innerHTML = `${dados.he100}h × (${formatarMoeda(calculos.valorHora)} × 2.00)`;

    document.getElementById('resHENoturna').innerText = formatarMoeda(calculos.totalHENoturna75);
    document.getElementById('refHENoturna75').innerText = formatarHoras(dados.heNoturna75);
    document.getElementById('formulaHENoturna').innerHTML = `${dados.heNoturna75}h × (Horas Extras 75% + Noturno 30%)`;

    document.getElementById('resHENoturna100').innerText = formatarMoeda(calculos.totalHENoturna100);
    document.getElementById('refHENoturna100').innerText = formatarHoras(dados.heNoturna100);
    document.getElementById('formulaHENoturna100').innerHTML = `${dados.heNoturna100}h × (Horas Extras 100% + Noturno 30%)`;

    document.getElementById('resSobreaviso').innerText = formatarMoeda(calculos.totalSobreaviso);
    document.getElementById('refSobreaviso').innerText = formatarHoras(dados.sobreaviso);
    document.getElementById('formulaSobreaviso').innerHTML = `${dados.sobreaviso}h × (${formatarMoeda(calculos.valorHora)} / 3)`;

    document.getElementById('resDSR').innerText = formatarMoeda(calculos.dsr);
    document.getElementById('formulaDSR').innerHTML = `<strong>DSR (Descanso Semanal Remunerado)</strong><br>Valor extra sobre suas horas extras e sobreaviso nos dias de folga.<br><br>${formatarMoeda(calculos.totalVariaveis)} / ${dados.diasUteis} dias úteis × ${dados.diasDescanso} descanso`;

    // ===== EXIBIR RESUMO FINANCEIRO =====
    document.getElementById('resBruto').innerText = formatarMoeda(calculos.salarioBruto);
    document.getElementById('resINSS').innerText = formatarMoeda(descontos.inss);
    document.getElementById('resIRRF').innerText = formatarMoeda(descontos.irrf);
    document.getElementById('resLiquido').innerText = formatarMoeda(salarioLiquido);
    
    // Fórmulas detalhadas ficam nos tooltips dinâmicos (tooltipINSS / tooltipIRRF)

    // ===== PREENCHER TOOLTIPS DINÂMICOS =====
    const baseIRRF = Math.round((calculos.salarioBruto - descontos.inss) * 100) / 100;

    // Tooltip INSS — com soma acumulada
    const tooltipINSS = document.getElementById('tooltipINSS');
    if (tooltipINSS) {
        const bruto = calculos.salarioBruto;
        const teto = 8475.55;
        const sal = Math.min(bruto, teto);
        let soma = 0;
        let linhas = '<strong>🧾 Como o INSS é calculado?</strong><br><br>';
        linhas += 'Seu salário é dividido em faixas. Cada faixa paga um percentual diferente, e no final somamos tudo:<br><br>';

        const f1 = Math.min(sal, 1621.00);
        const d1 = Math.round(f1 * 0.075 * 100) / 100;
        soma += d1;
        linhas += '1️⃣ R$ ' + f1.toFixed(2) + ' × 7,5% = R$ ' + d1.toFixed(2) + '<br>';

        if (sal > 1621.00) {
            const f2 = Math.min(sal, 2902.84) - 1621.00;
            const d2 = Math.round(f2 * 0.09 * 100) / 100;
            soma += d2;
            linhas += '2️⃣ R$ ' + f2.toFixed(2) + ' × 9% = R$ ' + d2.toFixed(2) + '<br>';
        }
        if (sal > 2902.84) {
            const f3 = Math.min(sal, 4354.27) - 2902.84;
            const d3 = Math.round(f3 * 0.12 * 100) / 100;
            soma += d3;
            linhas += '3️⃣ R$ ' + f3.toFixed(2) + ' × 12% = R$ ' + d3.toFixed(2) + '<br>';
        }
        if (sal > 4354.27) {
            const f4 = Math.min(sal, teto) - 4354.27;
            const d4 = Math.round(f4 * 0.14 * 100) / 100;
            soma += d4;
            linhas += '4️⃣ R$ ' + f4.toFixed(2) + ' × 14% = R$ ' + d4.toFixed(2) + '<br>';
        }

        linhas += '<br>Somando tudo:<br>';
        linhas += 'R$ ' + d1.toFixed(2);
        if (sal > 1621.00) {
            const d2 = Math.round((Math.min(sal, 2902.84) - 1621.00) * 0.09 * 100) / 100;
            linhas += ' + R$ ' + d2.toFixed(2);
        }
        if (sal > 2902.84) {
            const d3 = Math.round((Math.min(sal, 4354.27) - 2902.84) * 0.12 * 100) / 100;
            linhas += ' + R$ ' + d3.toFixed(2);
        }
        if (sal > 4354.27) {
            const d4 = Math.round((Math.min(sal, teto) - 4354.27) * 0.14 * 100) / 100;
            linhas += ' + R$ ' + d4.toFixed(2);
        }
        linhas += ' = <strong>R$ ' + descontos.inss.toFixed(2) + '</strong>';

        if (bruto > teto) {
            linhas += '<br><br>⚠️ Seu salário é maior que o teto (R$ 8.475,55). Mesmo ganhando mais, o máximo que se desconta de INSS é <strong>R$ 988,07</strong>.';
        }

        tooltipINSS.innerHTML = linhas;
    }

    // Tooltip IRRF — explicação clara por cenário
    const tooltipIRRF = document.getElementById('tooltipIRRF');
    if (tooltipIRRF) {
        let linhas = '<strong>🧾 Como o Imposto de Renda é calculado?</strong><br><br>';
        linhas += '<strong>Passo 1:</strong> Tirar o INSS do bruto:<br>';
        linhas += 'R$ ' + calculos.salarioBruto.toFixed(2) + ' − R$ ' + descontos.inss.toFixed(2) + ' = <strong>R$ ' + baseIRRF.toFixed(2) + '</strong><br>';
        linhas += '<small>(esse valor é a "base de cálculo")</small><br><br>';

        if (baseIRRF <= 5000.00) {
            linhas += '<strong>Passo 2:</strong> Verificar a faixa:<br>';
            linhas += '✅ Até R$ 5.000 → <strong>Isento!</strong><br>';
            linhas += 'Você não paga nada de IR.';

        } else if (baseIRRF <= 7350.00) {
            linhas += '<strong>Passo 2:</strong> Verificar a faixa:<br>';
            linhas += 'Sua base (R$ ' + baseIRRF.toFixed(2) + ') está entre R$ 5.000 e R$ 7.350.<br><br>';

            linhas += '<strong>Passo 3:</strong> Calcular o imposto normal:<br>';
            const impostoTab = calcularImpostoTabela(baseIRRF);
            const faixaInfo = obterFaixaIRRF(baseIRRF);
            linhas += 'R$ ' + baseIRRF.toFixed(2) + ' × ' + faixaInfo.aliquotaTexto + ' − R$ ' + faixaInfo.deducaoTexto + ' = R$ ' + impostoTab.toFixed(2) + '<br><br>';

            linhas += '<strong>Passo 4:</strong> Aplicar o benefício da reforma:<br>';
            linhas += 'Quem ganha nessa faixa tem direito a pagar menos IR. ';
            linhas += 'Quanto mais perto de R$ 5.000, maior o abatimento. ';
            linhas += 'Quanto mais perto de R$ 7.350, menor o abatimento.<br><br>';
            const redutor = Math.round(Math.max(978.62 - (0.133145 * baseIRRF), 0) * 100) / 100;
            linhas += 'No seu caso, o abatimento é de R$ ' + redutor.toFixed(2) + '<br>';
            linhas += 'R$ ' + impostoTab.toFixed(2) + ' − R$ ' + redutor.toFixed(2) + ' = <strong>R$ ' + descontos.irrf.toFixed(2) + '</strong>';

        } else {
            linhas += '<strong>Passo 2:</strong> Verificar a faixa:<br>';
            linhas += 'Sua base (R$ ' + baseIRRF.toFixed(2) + ') é maior que R$ 7.350.<br>';
            linhas += 'Nesse caso, o cálculo segue a tabela padrão sem benefício extra.<br><br>';

            linhas += '<strong>Passo 3:</strong> Aplicar a porcentagem da sua faixa:<br>';
            const faixa = obterFaixaIRRF(baseIRRF);
            const valorBrutoIR = Math.round(baseIRRF * faixa.aliquota * 100) / 100;
            linhas += 'R$ ' + baseIRRF.toFixed(2) + ' × ' + faixa.aliquotaTexto + ' = R$ ' + valorBrutoIR.toFixed(2) + '<br><br>';

            linhas += '<strong>Passo 4:</strong> Subtrair o ajuste da faixa:<br>';
            linhas += 'Cada faixa tem um valor de ajuste pra que você não pague a porcentagem cheia sobre tudo. ';
            linhas += 'Na sua faixa (' + faixa.aliquotaTexto + '), o ajuste é R$ ' + faixa.deducaoTexto + '.<br><br>';
            linhas += 'R$ ' + valorBrutoIR.toFixed(2) + ' − R$ ' + faixa.deducaoTexto + ' = <strong>R$ ' + descontos.irrf.toFixed(2) + '</strong>';
        }

        tooltipIRRF.innerHTML = linhas;
    }
    
    // ===== MOSTRAR A SEÇÃO DE RESULTADOS =====
    const resultadosEl = document.getElementById('resultados');
    resultadosEl.style.display = 'block';

    // ===== ESCONDER LINHAS ZERADAS =====
    const linhasGanhos = [
        { id: 'resHE75', valor: calculos.totalHE75 },
        { id: 'resHE100', valor: calculos.totalHE100 },
        { id: 'resHENoturna', valor: calculos.totalHENoturna75 },
        { id: 'resHENoturna100', valor: calculos.totalHENoturna100 },
        { id: 'resSobreaviso', valor: calculos.totalSobreaviso },
        { id: 'resDSR', valor: calculos.dsr }
    ];
    linhasGanhos.forEach(function(item) {
        const el = document.getElementById(item.id);
        if (el && el.closest('.detail-line')) {
            el.closest('.detail-line').style.display = item.valor === 0 ? 'none' : 'flex';
        }
    });

    // ===== ANIMAÇÃO DE CONTAGEM NO VALOR LÍQUIDO =====
    animarValor('resLiquido', salarioLiquido);


}

/**
 * Animação de contagem para o valor líquido
 */
function animarValor(elementId, valorFinal) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const duracao = 600;
    const inicio = performance.now();
    const valorInicial = 0;

    function step(timestamp) {
        const progresso = Math.min((timestamp - inicio) / duracao, 1);
        // Easing: ease-out cubic
        const ease = 1 - Math.pow(1 - progresso, 3);
        const valorAtual = valorInicial + (valorFinal - valorInicial) * ease;
        el.innerText = formatarMoeda(valorAtual);
        if (progresso < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}



/**
 * Mostra ou esconde a badge indicando que o salário base veio do localStorage
 */
function mostrarBadgeSalarioSalvo(mostrar) {
    var badge = document.getElementById('salarioBaseSalvoBadge');
    if (badge) badge.style.display = mostrar ? 'inline-flex' : 'none';
}

/**
 * Reseta todos os campos e esconde resultados
 */
function resetarCampos() {
    var campos = ['salarioBase','he75','he100','heNoturna75','heNoturna100','sobreaviso'];
    campos.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    var bonEl = document.getElementById('bonificacao');
    if (bonEl) bonEl.value = '0';
    // Resetar mês/ano para o atual
    var mesRefEl = document.getElementById('mesRef');
    var anoRefEl = document.getElementById('anoRef');
    if (mesRefEl) mesRefEl.value = new Date().getMonth() + 1;
    if (anoRefEl) anoRefEl.value = new Date().getFullYear();
    document.getElementById('resultados').style.display = 'none';
    try { localStorage.removeItem('calcSalario_salarioBase'); } catch(e) {}
    mostrarBadgeSalarioSalvo(false);
    // Recalcular dias úteis pro mês atual
    atualizarDiasPorMesAno();
    // Atualizar URL
    if (window.urlShare && typeof window.urlShare.atualizarUrlCompartilhavel === 'function') {
        window.urlShare.atualizarUrlCompartilhavel();
    }
}

/**
 * Formata horas decimais para formato HH:MM (ex: 2.5 → "2:30")
 */
function formatarHoras(horasDecimal) {
    if (!horasDecimal || horasDecimal === 0) return '-';
    var h = Math.floor(horasDecimal);
    var m = Math.round((horasDecimal - h) * 60);
    return h + ':' + String(m).padStart(2, '0') + 'h';
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
                var linhas = '<span style="opacity:0.7">📅 Feriados neste mês:</span><br>';
                for (var i = 0; i < res.feriadosNoMes.length; i++) {
                    var f = res.feriadosNoMes[i];
                    var dia = String(f.data.getDate()).padStart(2, '0');
                    var diaSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][f.data.getDay()];
                    linhas += '&nbsp;&nbsp;' + dia + ' (' + diaSemana + ') — ' + f.nome;
                    if (i < res.feriadosNoMes.length - 1) linhas += '<br>';
                }
                feriadosListaEl.innerHTML = linhas;
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

    // Sempre calcular feriados e info do mês
    atualizarDiasPorMesAno();

    // Se a URL forçou diasUteis/diasDescanso, sobrescrever os valores calculados
    if (hasDiasUteisParam) {
        var diasUteisInput = document.getElementById('diasUteis');
        if (diasUteisInput) diasUteisInput.value = urlParams.get('diasUteis');
    }
    if (hasDiasDescansoParam) {
        var diasDescansoInput = document.getElementById('diasDescanso');
        if (diasDescansoInput) diasDescansoInput.value = urlParams.get('diasDescanso');
    }

    // Listeners para recalcular ao trocar mês/ano
    if (mesRefEl) mesRefEl.addEventListener('change', atualizarDiasPorMesAno);
    if (anoRefEl) anoRefEl.addEventListener('change', atualizarDiasPorMesAno);
    if (anoRefEl) anoRefEl.addEventListener('input', atualizarDiasPorMesAno);

    // Delegar inicialização da URL compartilhável
    if (window.urlShare && typeof window.urlShare.init === 'function') {
        try { window.urlShare.init(); } catch (e) { console.warn('Erro ao iniciar urlShare:', e); }
    }

    // ===== RESTAURAR SALÁRIO BASE DO LOCALSTORAGE (se não veio da URL) =====
    if (!urlParams.has('salarioBase')) {
        try {
            var salarioSalvo = localStorage.getItem('calcSalario_salarioBase');
            if (salarioSalvo && salarioSalvo !== '0' && salarioSalvo !== '') {
                var salarioBaseEl = document.getElementById('salarioBase');
                if (salarioBaseEl && !salarioBaseEl.value) {
                    salarioBaseEl.value = salarioSalvo;
                    mostrarBadgeSalarioSalvo(true);
                }
            }
        } catch(e) {}
    }

    // ===== CÁLCULO AUTOMÁTICO AO DIGITAR =====
    var _calcTimer = null;
    function calcularComDebounce() {
        clearTimeout(_calcTimer);
        _calcTimer = setTimeout(function() {
            var salBase = parseFloat(document.getElementById('salarioBase').value) || 0;
            if (salBase > 0) {
                calcularSalario();
            }
        }, 400);
    }

    var camposAutoCalc = ['salarioBase','bonificacao','he75','he100','heNoturna75','heNoturna100','sobreaviso','diasUteis','diasDescanso'];
    camposAutoCalc.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calcularComDebounce);
            el.addEventListener('change', calcularComDebounce);
        }
    });

    // Salvar salário base no localStorage ao digitar e esconder badge
    var salarioBaseInput = document.getElementById('salarioBase');
    if (salarioBaseInput) {
        salarioBaseInput.addEventListener('input', function() {
            mostrarBadgeSalarioSalvo(false);
            try {
                var val = salarioBaseInput.value.trim();
                if (val && val !== '0') {
                    localStorage.setItem('calcSalario_salarioBase', val);
                } else {
                    localStorage.removeItem('calcSalario_salarioBase');
                }
            } catch(e) {}
        });
    }

    // Recalcular também ao trocar mês/ano (após atualizar dias)
    if (mesRefEl) mesRefEl.addEventListener('change', function() { setTimeout(calcularComDebounce, 50); });
    if (anoRefEl) anoRefEl.addEventListener('input', function() { setTimeout(calcularComDebounce, 50); });

    // Se já tem salário base (restaurado ou via URL), calcular automaticamente
    var salBaseInicial = parseFloat(document.getElementById('salarioBase').value) || 0;
    if (salBaseInicial > 0) {
        setTimeout(function() { calcularSalario(); }, 100);
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