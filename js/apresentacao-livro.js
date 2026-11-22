/*apresentação dinâmica do livro*/

document.addEventListener('DOMContentLoaded', () => {
  // LER O IDENTIFICADOR PRESENTE NA URL
  const parametros = new URLSearchParams(window.location.search);
  const idLivro = parametros.get('livro') || 'dom-casmurro';

  // ACESSAR O CATÁLOGO COMPARTILHADO
  const catalogo = window.LPF_LIVROS;

  if (!catalogo || !Object.prototype.hasOwnProperty.call(catalogo, idLivro)) {
    const card = document.querySelector('.apresentacao-card');
    const inferior = document.querySelector('.apresentacao-inferior');

    if (card) card.style.display = 'none';
    if (inferior) inferior.style.display = 'none';

    const mensagem = document.createElement('p');
    mensagem.textContent =
      'Livro não encontrado. Volte para Descobrir e escolha outra obra.';

    document.querySelector('.apresentacao-main').appendChild(mensagem);

    return;
  }

  const livro = catalogo[idLivro];

  // ATUALIZAR TÍTULO E AUTOR
  document.querySelector('#apresentacaoTitulo').textContent = livro.titulo;

  document.querySelector('#apresentacaoAutor').textContent = livro.autor;

  // ATUALIZAR CAPA
  const capa = document.querySelector('#apresentacaoCapa');

  capa.src = livro.capa;
  capa.alt = `Capa do livro ${livro.titulo}`;

  // ATUALIZAR INFORMAÇÕES
  document.querySelector('#apresentacaoGenero').textContent = livro.genero;

  document.querySelector('#apresentacaoAno').textContent = livro.ano;

  const totalPaginas = livro.totalPaginas;

  document.querySelector('#apresentacaoPaginas').textContent =
    Number.isInteger(totalPaginas) && totalPaginas > 0
      ? `${totalPaginas} páginas`
      : 'Não informado';

  document.querySelector('.apresentacao-etiqueta').textContent = livro.etiqueta;

  document.querySelector('.detalhe-item small').textContent = livro.subgenero;

  // ATUALIZAR DESCRIÇÃO E SINOPSE
  document.querySelector('.apresentacao-descricao').textContent =
    livro.descricao;

  document.querySelector('#sinopseLivro').textContent = livro.sinopse;

  // ATUALIZAR TÍTULO DA ABA DO NAVEGADOR
  document.title = `${livro.titulo} | LPF`;

  /*add na minha estante*/

  const botaoAdicionar = document.querySelector('#adicionarEstante');
  const avisoEstante = document.querySelector('.apresentacao-aviso');

  // ATUALIZAR O BOTÃO QUANDO O LIVRO JÁ ESTIVER SALVO
  function atualizarBotaoEstante() {
    const livroSalvo = window.LPF_ESTANTE.buscar(idLivro);

    if (livroSalvo) {
      botaoAdicionar.disabled = true;
      botaoAdicionar.textContent = 'Livro já está na Minha Estante';

      avisoEstante.textContent = 'Este livro já foi adicionado à sua estante.';
    }
  }

  if (botaoAdicionar && avisoEstante) {
    // VERIFICAR SE O LIVRO JÁ ESTAVA SALVO
    atualizarBotaoEstante();

    // ADICIONAR AO CLICAR
    botaoAdicionar.addEventListener('click', () => {
      const resultado = window.LPF_ESTANTE.adicionar(idLivro);

      if (!resultado.sucesso) {
        avisoEstante.textContent = resultado.mensagem;

        if (resultado.codigo === 'LIMITE_ATINGIDO') {
          avisoEstante.classList.add('aviso-limite');
          avisoEstante.setAttribute('role', 'alert');

          const linkEstante = document.createElement('a');
          linkEstante.href = 'MinhaEstante.html';
          linkEstante.textContent = 'Ir para Minha Estante';

          avisoEstante.appendChild(linkEstante);
        }

        return;
      }

      atualizarBotaoEstante();

      if (resultado.adicionado) {
        avisoEstante.textContent = resultado.mensagem;
      }
    });
  }
});
