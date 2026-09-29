// ===== DADOS FICTÍCIOS (9º ANO) =====
// Array de objetos: cada objeto é uma disciplina com suas notas e faltas.
const disciplinas = [
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

// Frequência fictícia (apenas demonstração — será tratada de outra forma no futuro)
const FREQUENCIA_DEMONSTRATIVA = 92;
const MEDIA_MINIMA = 6.0;

// ===== FUNÇÃO: normalizarNota =====
// Converte qualquer valor de nota para a escala 0–10.
// Retorna null quando a nota ainda não foi lançada ou é inválida.
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") return null;

  // Aceita vírgula como separador decimal
  const texto = String(valor).replace(",", ".");
  const numero = Number(texto);

  if (isNaN(numero)) return null;

  if (numero >= 0 && numero <= 10) return numero;
  if (numero > 10 && numero <= 100) return numero / 10;

  return null; // fora das regras → inválido
}

// ===== FUNÇÃO: calcularMedia =====
// Usa somente as notas disponíveis (nunca transforma ausente em zero).
function calcularMedia(notas) {
  const validas = notas.filter((n) => n !== null);
  if (validas.length === 0) return null;

  const soma = validas.reduce((acc, n) => acc + n, 0);
  return soma / validas.length;
}

// ===== FUNÇÃO: somarFaltas =====
function somarFaltas(faltas) {
  return faltas.reduce((acc, f) => acc + f, 0);
}

// ===== FUNÇÃO: definirSituacao =====
function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

// ===== FUNÇÃO: formatarNota =====
function formatarNota(nota) {
  if (nota === null) return "Ainda não lançada";
  return nota.toFixed(1).replace(".", ",");
}

// ===== FUNÇÃO: classeSituacao =====
function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-indisponivel";
}

// ===== PROCESSAMENTO DOS DADOS =====
const resultados = disciplinas.map((d) => {
  const n1 = normalizarNota(d.tri1);
  const n2 = normalizarNota(d.tri2);
  const n3 = normalizarNota(d.tri3);

  const media = calcularMedia([n1, n2, n3]);
  const totalFaltas = somarFaltas(d.faltas);
  const situacao = definirSituacao(media);

  return { disciplina: d.disciplina, n1, n2, n3, media, totalFaltas, situacao };
});

// ===== PREENCHER A TABELA (DOM) =====
const corpoTabela = document.getElementById("corpo-tabela");

resultados.forEach((r) => {
  const linha = document.createElement("tr");

  linha.innerHTML = `
    <td>${r.disciplina}</td>
    <td>${formatarNota(r.n1)}</td>
    <td>${formatarNota(r.n2)}</td>
    <td>${formatarNota(r.n3)}</td>
    <td>${formatarNota(r.media)}</td>
    <td>${r.totalFaltas}</td>
    <td class="${classeSituacao(r.situacao)}">${r.situacao}</td>
  `;

  corpoTabela.appendChild(linha);
});

// ===== CARDS DE RESUMO =====
// Média geral: média das médias disponíveis (ignora as indisponíveis)
const mediasDisponiveis = resultados
  .map((r) => r.media)
  .filter((m) => m !== null);

const mediaGeral = mediasDisponiveis.length
  ? mediasDisponiveis.reduce((a, b) => a + b, 0) / mediasDisponiveis.length
  : null;

// Total de faltas
const totalFaltas = resultados.reduce((acc, r) => acc + r.totalFaltas, 0);

// Contagens por situação
const qtdBom = resultados.filter((r) => r.situacao === "Bom desempenho").length;
const qtdAtencao = resultados.filter((r) => r.situacao === "Atenção").length;

// Preencher os cards
document.getElementById("media-geral").textContent =
  mediaGeral !== null ? formatarNota(mediaGeral) : "—";

document.getElementById("total-faltas").textContent = totalFaltas;

document.getElementById("qtd-bom").textContent = qtdBom;
document.getElementById("qtd-atencao").textContent = qtdAtencao;

document.getElementById("frequencia").textContent =
  FREQUENCIA_DEMONSTRATIVA + "% — Frequência adequada";