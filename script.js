/* Configuração fixa do estudante */
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 12,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* PIN mantido apenas em memória durante a sessão de uso */
let pinSessao = "";

/* Dados padrão do 9º Ano (utilizados caso não existam dados salvos no servidor) */
const dadosPadrao = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

/* Array global que armazena o boletim em exibição */
let boletimAtual = [];

/* Função para normalizar dados antigos do projeto (escala 0-10) */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  let str = String(valor).replace(",", ".");
  let num = parseFloat(str);
  if (isNaN(num)) {
    return null;
  }
  if (num >= 0 && num <= 10) {
    return num;
  }
  if (num > 10 && num <= 100) {
    return num / 10;
  }
  return null;
}

/* Validação para novas notas inseridas na edição (deve aceitar de 0 a 10) */
function validarNotaDigitada(valorStr) {
  if (valorStr === null || valorStr === undefined || valorStr.trim() === "") {
    return { valida: true, valor: null };
  }
  let str = valorStr.trim().replace(",", ".");
  let num = Number(str);
  if (isNaN(num) || num < 0 || num > 10) {