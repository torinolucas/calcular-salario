# 📊 Calculadora de Salário

Uma calculadora web responsiva para cálculo de salário líquido com horas extras, descanso semanal remunerado (DSR) e descontos oficiais.

## 🏗️ Estrutura do Projeto

```
calculadora-salario/
│
├── 📄 index.html              # Página principal (HTML limpo)
├── 📁 css/
│   └── 📄 styles.css          # Todos os estilos CSS organizados
├── 📁 js/
│   └── 📄 calculator.js       # Lógica de cálculo modularizada
└── 📄 README.md              # Este arquivo
```

## ✨ Funcionalidades

### 📋 Dados de Entrada
- **Salário Base**: Valor fixo mensal
- **Bonificação**: Valores adicionais fixos
- **Horas Extras 75%**: Horas extras com adicional de 75%
- **Horas Extras 100%**: Horas extras com adicional de 100%
- **H.E. Noturnas 75%**: Horas extras noturnas (75% + 30% noturno)
- **Horas Sobreaviso**: Horas em sobreaviso (valor/hora ÷ 3)
- **Dias Úteis**: Dias úteis do mês para cálculo do DSR
- **Domingos e Feriados**: Dias de descanso para DSR

### 🧮 Cálculos Realizados

#### **Valor da Hora**
```
(Salário Base + Bonificação) ÷ 200
```

#### **Horas Extras**
- **75%**: `Horas × (Valor/Hora × 1.75)`
- **100%**: `Horas × (Valor/Hora × 2.00)`
- **Noturnas**: `Horas × ((Valor/Hora × 1.75) + (Valor/Hora × 0.30))`

#### **Sobreaviso**
```
Horas × (Valor/Hora ÷ 3)
```

#### **DSR (Descanso Semanal Remunerado)**
```
(Total de Variáveis ÷ Dias Úteis) × Dias de Descanso
```

#### **Descontos**
- **INSS**: Cálculo progressivo conforme tabela oficial
- **IRRF**: Cálculo progressivo com dedução padrão

## 🎨 Características Técnicas

### **CSS Organizado**
- ✅ Estrutura modular com comentários
- ✅ Responsividade completa para mobile
- ✅ Animações suaves
- ✅ Estados de hover e focus
- ✅ Grid layout adaptativo

### **JavaScript Modular**
- ✅ Funções bem documentadas
- ✅ Separação clara de responsabilidades
- ✅ Tratamento de dados de entrada
- ✅ Cálculos isolados em funções específicas
- ✅ Formatação consistente de resultados

### **HTML Semântico**
- ✅ Estrutura limpa e organizada
- ✅ Labels apropriados para acessibilidade
- ✅ Meta tags para SEO e responsividade
- ✅ Referências externas organizadas

## 📱 Responsividade

- **Desktop**: Layout em duas colunas
- **Mobile**: Layout em uma coluna com espaçamento otimizado
- **Tablets**: Adaptação automática baseada na largura

## 🚀 Como Usar

1. Abra o arquivo `index.html` em um navegador
2. Preencha os campos desejados
3. Clique em "Calcular Salário Líquido"
4. Visualize os resultados detalhados com fórmulas

## 🔧 Desenvolvimento

### **Modificar Estilos**
Edite o arquivo `css/styles.css` - todas as alterações visuais estão organizadas por seções.

### **Modificar Cálculos**
Edite o arquivo `js/calculator.js` - a lógica está modularizada em funções específicas.

### **Modificar Estrutura**
Edite o arquivo `index.html` - apenas a estrutura HTML, sem estilos ou scripts inline.

## 📊 Valores de Referência (2024/2025)

### **Faixas INSS**
- Até R$ 1.412,00: 7,5%
- R$ 1.412,01 a R$ 2.666,68: 9%
- R$ 2.666,69 a R$ 4.000,03: 12%
- R$ 4.000,04 a R$ 7.786,02: 14%
- Teto máximo: R$ 908,85

### **Faixas IRRF**
- Até R$ 2.259,20: Isento
- R$ 2.259,21 a R$ 2.826,65: 7,5%
- R$ 2.826,66 a R$ 3.751,05: 15%
- R$ 3.751,06 a R$ 4.664,68: 22,5%
- Acima de R$ 4.664,68: 27,5%

---

**Desenvolvido com ❤️ para facilitar cálculos salariais precisos**