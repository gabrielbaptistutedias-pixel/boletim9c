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
    return { valida: false, valor: null };
  }
  return { valida: true, valor: num };
}

/* Validação para faltas inseridas na edição (inteiro >= 0) */
function validarFaltaDigitada(valorStr) {
  if (valorStr === null || valorStr === undefined || valorStr.trim() === "") {
    return { valida: false, valor: null };
  }
  let str = valorStr.trim();
  if (!/^\d+$/.test(str)) {
    return { valida: false, valor: null };
  }
  let num = parseInt(str, 10);
  if (isNaN(num) || num < 0) {
    return { valida: false, valor: null };
  }
  return { valida: true, valor: num };
}

/* Formata o número para exibição com 1 casa decimal */
function formatarNota(nota) {
  if (nota === null || nota === undefined) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

/* Calcula média, total de faltas e situação de cada disciplina */
function processarDisciplina(d) {
  const n1 = normalizarNota(d.tri1);
  const n2 = normalizarNota(d.tri2);
  const n3 = normalizarNota(d.tri3);

  let somaNotas = 0;
  let qtdNotas = 0;

  if (n1 !== null) { somaNotas += n1; qtdNotas++; }
  if (n2 !== null) { somaNotas += n2; qtdNotas++; }
  if (n3 !== null) { somaNotas += n3; qtdNotas++; }

  let media = qtdNotas > 0 ? somaNotas / qtdNotas : null;

  let totalFaltas = 0;
  if (Array.isArray(d.faltas)) {
    totalFaltas = d.faltas.reduce((acc, f) => acc + (Number(f) || 0), 0);
  }

  let situacao = "Nota ainda não disponível";
  if (media !== null) {
    if (media >= 6.0) {
      situacao = "Bom desempenho";
    } else {
      situacao = "Atenção";
    }
  }

  return {
    disciplina: d.disciplina,
    n1, n2, n3,
    media,
    totalFaltas,
    faltasArray: Array.isArray(d.faltas) ? d.faltas : [0, 0, 0],
    situacao
  };
}

/* Atualiza a tabela principal e os cards de resumo */
function renderizarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMedias = 0;
  let qtdMedias = 0;
  let somaFaltasGeral = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  boletimAtual.forEach(item => {
    const proc = processarDisciplina(item);

    if (proc.media !== null) {
      somaMedias += proc.media;
      qtdMedias++;
    }

    somaFaltasGeral += proc.totalFaltas;

    if (proc.situacao === "Bom desempenho") bomDesempenho++;
    if (proc.situacao === "Atenção") atencao++;

    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = proc.disciplina;
    tr.appendChild(tdNome);

    const td1 = document.createElement("td");
    td1.textContent = formatarNota(proc.n1);
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.textContent = formatarNota(proc.n2);
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.textContent = formatarNota(proc.n3);
    tr.appendChild(td3);

    const tdMedia = document.createElement("td");
    tdMedia.textContent = formatarNota(proc.media);
    tr.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = proc.totalFaltas;
    tr.appendChild(tdFaltas);

    const tdSit = document.createElement("td");
    tdSit.textContent = proc.situacao;
    if (proc.situacao === "Bom desempenho") tdSit.className = "situacao-bom";
    else if (proc.situacao === "Atenção") tdSit.className = "situacao-atencao";
    else tdSit.className = "situacao-indisponivel";
    tr.appendChild(tdSit);

    corpoTabela.appendChild(tr);
  });

  const mediaGeral = qtdMedias > 0 ? (somaMedias / qtdMedias).toFixed(1).replace(".", ",") : "—";
  document.getElementById("media-geral").textContent = mediaGeral;
  document.getElementById("total-faltas").textContent = somaFaltasGeral;
  document.getElementById("qtd-bom").textContent = bomDesempenho;
  document.getElementById("qtd-atencao").textContent = atencao;

  /* Frequência demonstrativa fictícia fixada em 92% */
  document.getElementById("frequencia").textContent = "92% (Frequência adequada)";
}

/* Monta a tabela do formulário de edição */
function renderizarTabelaEdicao() {
  const corpo = document.getElementById("corpo-tabela-edicao");
  corpo.innerHTML = "";

  boletimAtual.forEach((d, idx) => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = d.disciplina;
    tr.appendChild(tdNome);

    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);
    const f = Array.isArray(d.faltas) ? d.faltas : [0, 0, 0];

    tr.innerHTML += `
      <td><input type="text" id="edit-n1-${idx}" value="${n1 !== null ? n1 : ''}"></td>
      <td><input type="text" id="edit-n2-${idx}" value="${n2 !== null ? n2 : ''}"></td>
      <td><input type="text" id="edit-n3-${idx}" value="${n3 !== null ? n3 : ''}"></td>
      <td><input type="text" id="edit-f1-${idx}" value="${f[0] !== undefined ? f[0] : 0}"></td>
      <td><input type="text" id="edit-f2-${idx}" value="${f[1] !== undefined ? f[1] : 0}"></td>
      <td><input type="text" id="edit-f3-${idx}" value="${f[2] !== undefined ? f[2] : 0}"></td>
    `;

    corpo.appendChild(tr);
  });
}

/* Evento de Login e Abertura via API */
document.getElementById("btn-entrar").addEventListener("click", async () => {
  const pinInput = document.getElementById("input-pin");
  const msgLogin = document.getElementById("msg-login");
  const pinDigitado = pinInput.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, digite o PIN.";
    msgLogin.style.color = "#b00020";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.style.color = "#0033a0";

  try {
    const response = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (response.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.style.color = "#b00020";
      return;
    }

    if (response.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.style.color = "#b00020";
      return;
    }

    if (!response.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.style.color = "#b00020";
      return;
    }

    const resData = await response.json();

    if (resData.dados && resData.dados.disciplinas && resData.dados.disciplinas.length > 0) {
      boletimAtual = resData.dados.disciplinas;
    } else {
      boletimAtual = JSON.parse(JSON.stringify(dadosPadrao));
    }

    pinSessao = pinDigitado;
    pinInput.value = "";
    msgLogin.textContent = "";

    document.getElementById("area-login").classList.add("oculto");
    document.getElementById("conteudo-boletim").classList.remove("oculto");

    renderizarBoletim();

  } catch (error) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.style.color = "#b00020";
  }
});

/* Abrir Modal de Edição */
document.getElementById("btn-editar").addEventListener("click", () => {
  renderizarTabelaEdicao();
  document.getElementById("msg-edicao").textContent = "";
  document.getElementById("area-edicao").classList.remove("oculto");
});

/* Cancelar Edição */
document.getElementById("btn-cancelar").addEventListener("click", () => {
  document.getElementById("area-edicao").classList.add("oculto");
});

/* Salvar Dados na API */
document.getElementById("btn-salvar").addEventListener("click", async () => {
  const msgEdicao = document.getElementById("msg-edicao");
  msgEdicao.textContent = "";

  let novosDados = [];
  let houverErro = false;

  for (let idx = 0; idx < boletimAtual.length; idx++) {
    const nomeDisc = boletimAtual[idx].disciplina;

    const valN1 = document.getElementById(`edit-n1-${idx}`).value;
    const valN2 = document.getElementById(`edit-n2-${idx}`).value;
    const valN3 = document.getElementById(`edit-n3-${idx}`).value;

    const valF1 = document.getElementById(`edit-f1-${idx}`).value;
    const valF2 = document.getElementById(`edit-f2-${idx}`).value;
    const valF3 = document.getElementById(`edit-f3-${idx}`).value;

    const resN1 = validarNotaDigitada(valN1);
    const resN2 = validarNotaDigitada(valN2);
    const resN3 = validarNotaDigitada(valN3);

    const resF1 = validarFaltaDigitada(valF1);
    const resF2 = validarFaltaDigitada(valF2);
    const resF3 = validarFaltaDigitada(valF3);

    if (!resN1.valida || !resN2.valida || !resN3.valida) {
      msgEdicao.textContent = `Nota inválida na disciplina "${nomeDisc}". Use valores entre 0 e 10.`;
      msgEdicao.style.color = "#b00020";
      houverErro = true;
      break;
    }

    if (!resF1.valida || !resF2.valida || !resF3.valida) {
      msgEdicao.textContent = `Falta inválida na disciplina "${nomeDisc}". Digite números inteiros sem sinal.`;
      msgEdicao.style.color = "#b00020";
      houverErro = true;
      break;
    }

    novosDados.push({
      disciplina: nomeDisc,
      tri1: resN1.valor,
      tri2: resN2.valor,
      tri3: resN3.valor,
      faltas: [resF1.valor, resF2.valor, resF3.valor]
    });
  }

  if (houverErro) return;

  msgEdicao.textContent = "Salvando...";
  msgEdicao.style.color = "#0033a0";

  try {
    const response = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novosDados
        }
      })
    });

    if (!response.ok) {
      msgEdicao.textContent = "Erro ao salvar os dados no servidor. Tente novamente.";
      msgEdicao.style.color = "#b00020";
      return;
    }

    boletimAtual = novosDados;
    renderizarBoletim();

    msgEdicao.textContent = "Dados salvos com sucesso!";
    msgEdicao.style.color = "#006400";

    setTimeout(() => {
      document.getElementById("area-edicao").classList.add("oculto");
    }, 1200);

  } catch (error) {
    msgEdicao.textContent = "Falha de conexão ao salvar. Mantenha os dados e tente novamente.";
    msgEdicao.style.color = "#b00020";
  }
});