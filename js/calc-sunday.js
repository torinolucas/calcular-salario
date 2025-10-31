(function (global) {
    function calcularDiasUteisMes(mes, ano) {
        const ultimoDiaNum = new Date(ano, mes, 0).getDate(); 
        let diasUteis = 0;
        let domingos = 0;

        for (let d = 1; d <= ultimoDiaNum; d++) {
            const data = new Date(ano, mes - 1, d);
            const diaSemana = data.getDay();
            if (diaSemana === 0) {
                domingos++;
            } else {
                diasUteis++;
            }
        }

        return { diasUteis, domingos };
    }

    global.calcHolidays = {
        calcularDiasUteisMes
    };
})(window);
