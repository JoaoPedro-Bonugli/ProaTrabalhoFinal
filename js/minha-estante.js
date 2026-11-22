/*exibição e filtros dos livros*/

document.addEventListener('DOMContentLoaded', () => {
  const estante = window.LPF_ESTANTE;
  const catalogo = window.LPF_LIVROS;

  const grade = document.querySelector('#gradeEstante');
  const filtro = document.querySelector('#filtroStatus');
  const mensagemVazia = document.querySelector('#estanteVazia');

  const totalLivros = document.querySelector('#totalLivros');
  const totalQueroLer = document.querySelector('#totalQueroLer');
  const totalLendo = document.querySelector('#totalLendo');
  const totalLidos = document.querySelector('#totalLidos');

  if (!estante || !catalogo || !grade || !filtro || !mensagemVazia) {
    console.error('Não foi possível carregar a Minha Estante.');
    return;
  }

  const nomesStatus = {
    'quero-ler': 'Quero Ler',
    lendo: 'Lendo',
    lido: 'Lido',
  };

  // FUNÇÃO PARA CRIAR ELEMENTOS HTML
  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
  }

  // CRIAR CARD DO LIVRO
  function criarCard(registro) {
    const livro =
      registro.origem === 'manual' ? registro : catalogo[registro.id];

    // Por enquanto, exibimos os livros do catálogo.
    if (!livro) return null;

    const card = criarElemento('article', 'estante-card');
    card.dataset.id = registro.id;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Gerenciar leitura de ${livro.titulo}`);

    const capa = livro.capa
      ? criarElemento('img', 'estante-capa')
      : criarElemento('div', 'estante-capa estante-capa-padrao', 'LPF');

    if (livro.capa) {
      capa.src = livro.capa;
      capa.alt = `Capa de ${livro.titulo}`;
      capa.loading = 'lazy';
    } else {
      capa.setAttribute('role', 'img');
      capa.setAttribute('aria-label', 'Capa não informada');
    }

    const titulo = criarElemento('h3', 'estante-card-titulo', livro.titulo);

    const autor = criarElemento('p', 'estante-card-autor', livro.autor);

    const status = criarElemento(
      'span',
      'estante-status',
      nomesStatus[registro.status] || 'Quero Ler',
    );

    // CALCULAR O PROGRESSO
    const total = Number(registro.totalPaginas);
    const lidas = Math.max(0, Number(registro.paginasLidas) || 0);

    const temTotal =
      registro.totalPaginas !== null &&
      registro.totalPaginas !== undefined &&
      Number.isFinite(total) &&
      total > 0;

    const percentual = temTotal
      ? Math.min(100, Math.round((lidas / total) * 100))
      : null;

    const progressoTexto = criarElemento(
      'p',
      'estante-progresso-texto',
      percentual === null
        ? 'Progresso não informado'
        : `${percentual}% concluído — ${lidas} de ${total} páginas`,
    );

    const trilha = criarElemento('div', 'estante-progresso-trilha');

    const preenchimento = criarElemento('div', 'estante-progresso-valor');

    preenchimento.style.width = `${percentual ?? 0}%`;
    trilha.appendChild(preenchimento);
    trilha.setAttribute('aria-hidden', 'true');

    // AVALIAÇÃO DO LIVRO
    const nota = Number(registro.avaliacao);

    const avaliacaoValida =
      registro.avaliacao !== null &&
      registro.avaliacao !== undefined &&
      Number.isInteger(nota) &&
      nota >= 1 &&
      nota <= 5;

    const estrelas = avaliacaoValida
      ? '★'.repeat(nota) + '☆'.repeat(5 - nota)
      : 'Sem avaliação';

    const avaliacao = criarElemento(
      'p',
      'estante-avaliacao',
      avaliacaoValida ? `Avaliação: ${estrelas}` : estrelas,
    );

    card.append(capa, titulo, autor, status, progressoTexto, trilha, avaliacao);

    return card;
  }

  // ATUALIZAR CONTADORES
  function atualizarContadores(livros) {
    totalLivros.textContent = livros.length;

    totalQueroLer.textContent = livros.filter(
      (livro) => livro.status === 'quero-ler',
    ).length;

    totalLendo.textContent = livros.filter(
      (livro) => livro.status === 'lendo',
    ).length;

    totalLidos.textContent = livros.filter(
      (livro) => livro.status === 'lido',
    ).length;
  }

  // EXIBIR ESTANTE
  function renderizarEstante() {
    const livros = estante.listar();
    const statusSelecionado = filtro.value;

    atualizarContadores(livros);

    const livrosFiltrados = livros.filter((registro) => {
      return (
        statusSelecionado === 'todos' || registro.status === statusSelecionado
      );
    });

    // LIMPAR A GRADE ANTES DE RENDERIZAR
    grade.replaceChildren();

    livrosFiltrados.forEach((registro) => {
      const card = criarCard(registro);

      if (card) {
        grade.appendChild(card);
      }
    });

    const vazia = grade.children.length === 0;

    mensagemVazia.hidden = !vazia;

    if (vazia) {
      const titulo = mensagemVazia.querySelector('h2');
      const descricao = mensagemVazia.querySelector('p');
      const link = mensagemVazia.querySelector('a');

      if (livros.length === 0) {
        titulo.textContent = 'Sua estante está vazia';
        descricao.textContent =
          'Explore nosso catálogo e adicione livros para começar.';
        link.hidden = false;
      } else {
        titulo.textContent = 'Nenhum livro encontrado';
        descricao.textContent =
          'Não há livros disponíveis para o status selecionado.';
        link.hidden = true;
      }
    }
  }

  // ATUALIZAR AO MUDAR O FILTRO
  filtro.addEventListener('change', renderizarEstante);

  // CARREGAR OS LIVROS AO ABRIR A PÁGINA
  renderizarEstante();

  // MODAL DE GERENCIAMENTO

  const modal = document.querySelector('#modalEstante');
  const modalNome = document.querySelector('#modalNomeLivro');
  const modalAcoes = document.querySelector('#modalAcoes');
  const formEdicao = document.querySelector('#formEdicaoLivro');
  const erroEdicao = document.querySelector('#erroEdicao');

  let livroSelecionado = null;

  // ABRIR MODAL
  function abrirModal(idLivro) {
    const registro = estante.buscar(idLivro);
    const livro = registro?.origem === 'manual' ? registro : catalogo[idLivro];

    if (!registro || !livro) return;

    livroSelecionado = idLivro;
    modalNome.textContent = livro.titulo;

    modalAcoes.hidden = false;
    formEdicao.hidden = true;
    erroEdicao.hidden = true;

    modal.showModal();
  }

  // CLICAR EM UM CARD
  grade.addEventListener('click', (evento) => {
    const card = evento.target.closest('.estante-card');

    if (card) {
      abrirModal(card.dataset.id);
    }
  });

  // ABRIR PELO TECLADO
  grade.addEventListener('keydown', (evento) => {
    const card = evento.target.closest('.estante-card');

    if (card && (evento.key === 'Enter' || evento.key === ' ')) {
      evento.preventDefault();
      abrirModal(card.dataset.id);
    }
  });

  // FECHAR JANELA
  document
    .querySelector('#fecharModal')
    .addEventListener('click', () => modal.close());

  // EXIBIR FORMULÁRIO DE EDIÇÃO
  document.querySelector('#abrirEdicao').addEventListener('click', () => {
    const registro = estante.buscar(livroSelecionado);

    document.querySelector('#edicaoStatus').value = registro.status;

    document.querySelector('#edicaoLidas').value = registro.paginasLidas;

    document.querySelector('#edicaoTotal').value = registro.totalPaginas ?? '';

    document.querySelector('#edicaoAvaliacao').value = registro.avaliacao ?? '';

    document.querySelector('#edicaoComentario').value =
      registro.comentario || '';

    modalAcoes.hidden = true;
    formEdicao.hidden = false;
    erroEdicao.hidden = true;

    document.querySelector('#edicaoStatus').focus();
  });

  // CANCELAR EDIÇÃO
  document
    .querySelector('#cancelarEdicao')
    .addEventListener('click', () => modal.close());

  // SALVAR ALTERAÇÕES
  formEdicao.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const alteracoes = {
      status: document.querySelector('#edicaoStatus').value,
      paginasLidas: document.querySelector('#edicaoLidas').value,
      totalPaginas: document.querySelector('#edicaoTotal').value,
      avaliacao: document.querySelector('#edicaoAvaliacao').value,
      comentario: document.querySelector('#edicaoComentario').value,
    };

    const resultado = estante.atualizar(livroSelecionado, alteracoes);

    if (!resultado.sucesso) {
      erroEdicao.textContent = resultado.mensagem;
      erroEdicao.hidden = false;
      return;
    }

    modal.close();
    renderizarEstante();
  });
  document.querySelector('#removerLivro').addEventListener('click', () => {
    if (!livroSelecionado) return;

    const titulo =
      estante.buscar(livroSelecionado)?.titulo ||
      catalogo[livroSelecionado]?.titulo ||
      'este livro';

    // PEDIR CONFIRMAÇÃO
    const confirmar = window.confirm(
      `Deseja remover "${titulo}" da sua estante?\n\n` +
        'O progresso, a avaliação e o comentário ' +
        'também serão apagados.',
    );

    if (!confirmar) return;

    // EXECUTAR A REMOÇÃO
    const resultado = estante.remover(livroSelecionado);

    if (!resultado.sucesso) {
      window.alert(resultado.mensagem);
      return;
    }

    modal.close();
    livroSelecionado = null;

    // ATUALIZAR OS CARDS E CONTADORES
    renderizarEstante();
  });
});
