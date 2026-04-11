(function (global) {
    'use strict';

    // ===== CÁLCULO DA PÁSCOA (algoritmo de Meeus/Jones/Butcher) =====
    function calcularPascoa(ano) {
        var a = ano % 19;
        var b = Math.floor(ano / 100);
        var c = ano % 100;
        var d = Math.floor(b / 4);
        var e = b % 4;
        var f = Math.floor((b + 8) / 25);
        var g = Math.floor((b - f + 1) / 3);
        var h = (19 * a + b - d - g + 15) % 30;
        var i = Math.floor(c / 4);
        var k = c % 4;
        var l = (32 + 2 * e + 2 * i - h - k) % 7;
        var m = Math.floor((a + 11 * h + 22 * l) / 451);
        var mes = Math.floor((h + l - 7 * m + 114) / 31);   // 3=março, 4=abril
        var dia = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(ano, mes - 1, dia);
    }

    // ===== FERIADOS NACIONAIS BRASILEIROS =====
    // Retorna array de objetos { data: Date, nome: string }
    function obterFeriadosNacionais(ano) {
        var pascoa = calcularPascoa(ano);

        // Helper: clonar data e somar dias
        function somarDias(data, dias) {
            var d = new Date(data.getTime());
            d.setDate(d.getDate() + dias);
            return d;
        }

        // Feriados fixos
        var feriados = [
            { data: new Date(ano, 0, 1),   nome: 'Confraternização Universal' },
            { data: new Date(ano, 3, 21),   nome: 'Tiradentes' },
            { data: new Date(ano, 4, 1),    nome: 'Dia do Trabalho' },
            { data: new Date(ano, 8, 7),    nome: 'Independência do Brasil' },
            { data: new Date(ano, 9, 12),   nome: 'Nossa Sra. Aparecida' },
            { data: new Date(ano, 10, 2),   nome: 'Finados' },
            { data: new Date(ano, 10, 15),  nome: 'Proclamação da República' },
            { data: new Date(ano, 10, 20),  nome: 'Consciência Negra' },
            { data: new Date(ano, 11, 25),  nome: 'Natal' }
        ];

        // Feriados móveis (baseados na Páscoa)
        feriados.push({ data: somarDias(pascoa, -48), nome: 'Carnaval (2ª-feira)' });
        feriados.push({ data: somarDias(pascoa, -47), nome: 'Carnaval (3ª-feira)' });
        feriados.push({ data: somarDias(pascoa, -2),  nome: 'Sexta-feira Santa' });
        feriados.push({ data: somarDias(pascoa, 60),  nome: 'Corpus Christi' });

        return feriados;
    }

    // ===== CÁLCULO DE DIAS ÚTEIS, DOMINGOS E FERIADOS =====
    function calcularDiasUteisMes(mes, ano) {
        var ultimoDiaNum = new Date(ano, mes, 0).getDate();
        var feriados = obterFeriadosNacionais(ano);

        // Montar set de feriados do mês (chave: "YYYY-MM-DD")
        var feriadoSet = {};
        var feriadosNoMes = [];
        for (var f = 0; f < feriados.length; f++) {
            var fd = feriados[f].data;
            if (fd.getMonth() + 1 === mes) {
                var chave = fd.getFullYear() + '-' +
                    String(fd.getMonth() + 1).padStart(2, '0') + '-' +
                    String(fd.getDate()).padStart(2, '0');
                feriadoSet[chave] = true;
                feriadosNoMes.push(feriados[f]);
            }
        }

        var diasUteis = 0;
        var domingos = 0;
        var feriadosEmDiaUtil = 0;

        for (var d = 1; d <= ultimoDiaNum; d++) {
            var data = new Date(ano, mes - 1, d);
            var diaSemana = data.getDay();
            var chaveD = ano + '-' +
                String(mes).padStart(2, '0') + '-' +
                String(d).padStart(2, '0');
            var ehFeriado = feriadoSet[chaveD] || false;

            if (diaSemana === 0) {
                // Domingo
                domingos++;
            } else if (ehFeriado) {
                // Feriado em dia de semana (seg-sáb) — conta como descanso
                feriadosEmDiaUtil++;
            } else {
                diasUteis++;
            }
        }

        // "Domingos e Feriados" = domingos + feriados que caem em dia útil
        var descansoTotal = domingos + feriadosEmDiaUtil;

        return {
            diasUteis: diasUteis,
            domingos: domingos,
            feriadosEmDiaUtil: feriadosEmDiaUtil,
            descansoTotal: descansoTotal,
            feriadosNoMes: feriadosNoMes
        };
    }

    // Expor API
    global.calcHolidays = {
        calcularDiasUteisMes: calcularDiasUteisMes,
        obterFeriadosNacionais: obterFeriadosNacionais,
        calcularPascoa: calcularPascoa
    };
})(window);
