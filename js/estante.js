/*gerenciamento da estante*/

window.LPF_ESTANTE = (() => {
  // IDENTIFICADOR DOS DADOS NO NAVEGADOR
  const CHAVE_STORAGE = 'lpf_estante_v1';
  const LIMITE_LIVROS = 15;

  function verificarLimite(livros) {
    if (livros.length >= LIMITE_LIVROS) {
      return {
        sucesso: false,
        codigo: 'LIMITE_ATINGIDO',
        mensagem:
          'Sua estante atingiu o limite de 15 livros. ' +
          'Remova um livro da Minha Estante para adicionar outro.',
      };
    }

    return null;
  }

  // LER OS LIVROS SALVOS
  function lerEstante() {
    const dados = localStorage.getItem(CHAVE_STORAGE);

    if (!dados) {
      return [];
    }

    const estante = JSON.parse(dados);

    if (!Array.isArray(estante)) {
      throw new Error('Dados da estante inválidos.');
    }

    // COMPLETAR O TOTAL DE PÁGINAS DOS LIVROS DO CATÁLOGO
    return estante.map((registro) => {
      // Preservar o total já informado
      if (registro.totalPaginas != null) {
        return registro;
      }

      // Não modificar livros cadastrados manualmente
      if (registro.origem !== 'catalogo') {
        return registro;
      }

      // Consultar a quantidade de páginas no catálogo
      const catalogo = window.LPF_LIVROS || {};
      const livroCatalogo = catalogo[registro.id];

      if (!livroCatalogo) {
        return registro;
      }

      const total = livroCatalogo.totalPaginas;

      if (!Number.isInteger(total) || total <= 0) {
        return registro;
      }

      // Preencher automaticamente o total de páginas
      return {
        ...registro,
        totalPaginas: total,
      };
    });
  }

  // LISTAR OS LIVROS
  function listar() {
    try {
      return lerEstante();
    } catch (erro) {
      console.error('Erro ao consultar estante:', erro);
      return [];
    }
  }

  // BUSCAR UM LIVRO PELO ID
  function buscar(idLivro) {
    try {
      return lerEstante().find((livro) => livro.id === idLivro) || null;
    } catch (erro) {
      console.error('Erro ao buscar livro:', erro);
      return null;
    }
  }

  // ADICIONAR LIVRO À ESTANTE
  function adicionar(idLivro) {
    // CONFERIR SE O LIVRO EXISTE NO CATÁLOGO
    const catalogo = window.LPF_LIVROS || {};

    if (!Object.prototype.hasOwnProperty.call(catalogo, idLivro)) {
      return {
        sucesso: false,
        mensagem: 'Livro não encontrado no catálogo.',
      };
    }

    try {
      const estante = lerEstante();

      // EVITAR LIVROS DUPLICADOS
      const jaExiste = estante.some((livro) => livro.id === idLivro);

      if (jaExiste) {
        return {
          sucesso: true,
          adicionado: false,
          mensagem: 'Este livro já está na sua estante.',
        };
      }

      const bloqueio = verificarLimite(estante);

      if (bloqueio) {
        return bloqueio;
      }
      // CRIAR O REGISTRO DE LEITURA
      const novoLivro = {
        id: idLivro,
        origem: 'catalogo',
        status: 'quero-ler',
        paginasLidas: 0,
        totalPaginas: catalogo[idLivro].totalPaginas ?? null,
        avaliacao: null,
        comentario: '',
        adicionadoEm: new Date().toISOString(),
      };

      estante.push(novoLivro);

      // SALVAR NO NAVEGADOR
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estante));

      return {
        sucesso: true,
        adicionado: true,
        mensagem: 'Livro adicionado à sua estante!',
      };
    } catch (erro) {
      console.error('Erro ao salvar livro:', erro);

      return {
        sucesso: false,
        mensagem: 'Não foi possível salvar o livro.',
      };
    }
  }

  // ATUALIZAR INFORMAÇÕES DE LEITURA
  function atualizar(idLivro, alteracoes) {
    const statusPermitidos = ['quero-ler', 'lendo', 'lido'];
    const status = alteracoes.status;
    const paginasLidas = Number(alteracoes.paginasLidas);

    const totalPaginas =
      alteracoes.totalPaginas === '' ? null : Number(alteracoes.totalPaginas);

    const avaliacao =
      alteracoes.avaliacao === '' ? null : Number(alteracoes.avaliacao);

    const comentario = String(alteracoes.comentario || '').trim();

    // VALIDAR AS INFORMAÇÕES
    if (!statusPermitidos.includes(status)) {
      return { sucesso: false, mensagem: 'Status inválido.' };
    }

    if (
      alteracoes.paginasLidas === '' ||
      !Number.isInteger(paginasLidas) ||
      paginasLidas < 0
    ) {
      return {
        sucesso: false,
        mensagem: 'Informe uma quantidade válida de páginas lidas.',
      };
    }

    if (
      totalPaginas !== null &&
      (!Number.isInteger(totalPaginas) || totalPaginas <= 0)
    ) {
      return {
        sucesso: false,
        mensagem: 'O total de páginas deve ser maior que zero.',
      };
    }

    if (totalPaginas !== null && paginasLidas > totalPaginas) {
      return {
        sucesso: false,
        mensagem: 'Páginas lidas não podem superar o total.',
      };
    }

    if (
      avaliacao !== null &&
      (!Number.isInteger(avaliacao) || avaliacao < 1 || avaliacao > 5)
    ) {
      return { sucesso: false, mensagem: 'Avaliação inválida.' };
    }

    try {
      const livros = lerEstante();
      const indice = livros.findIndex((livro) => livro.id === idLivro);

      if (indice === -1) {
        return { sucesso: false, mensagem: 'Livro não encontrado.' };
      }

      livros[indice] = {
        ...livros[indice],
        status,
        paginasLidas,
        totalPaginas,
        avaliacao,
        comentario,
      };

      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(livros));

      return {
        sucesso: true,
        mensagem: 'Leitura atualizada com sucesso!',
      };
    } catch (erro) {
      console.error('Erro ao atualizar leitura:', erro);
      return {
        sucesso: false,
        mensagem: 'Não foi possível salvar as alterações.',
      };
    }
  }

  // REMOVER UM LIVRO DA ESTANTE
  function remover(idLivro) {
    try {
      const livros = lerEstante();

      const existe = livros.some((livro) => livro.id === idLivro);

      if (!existe) {
        return {
          sucesso: false,
          mensagem: 'Livro não encontrado na estante.',
        };
      }

      const estanteAtualizada = livros.filter((livro) => livro.id !== idLivro);

      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estanteAtualizada));

      return {
        sucesso: true,
        mensagem: 'Livro removido da estante.',
      };
    } catch (erro) {
      console.error('Erro ao remover livro:', erro);

      return {
        sucesso: false,
        mensagem: 'Não foi possível remover o livro.',
      };
    }
  }

  // ADD LIVRO MANUALMENTE

  function adicionarManual(dados) {
    const titulo = String(dados.titulo || '').trim();
    const autor = String(dados.autor || '').trim();
    const genero = String(dados.genero || '').trim();

    const status = dados.status || 'quero-ler';

    const ano = dados.ano === '' ? null : Number(dados.ano);

    const totalPaginas =
      dados.totalPaginas === '' ? null : Number(dados.totalPaginas);

    const paginasLidas =
      dados.paginasLidas === '' ? 0 : Number(dados.paginasLidas);

    const avaliacao = dados.avaliacao === '' ? null : Number(dados.avaliacao);

    const comentario = String(dados.comentario || '').trim();

    // VALIDAR CAMPOS OBRIGATÓRIOS
    if (!titulo || !autor || !genero) {
      return {
        sucesso: false,
        mensagem: 'Preencha título, autor e gênero.',
      };
    }

    // VALIDAR STATUS
    if (!['quero-ler', 'lendo', 'lido'].includes(status)) {
      return {
        sucesso: false,
        mensagem: 'Status de leitura inválido.',
      };
    }

    // VALIDAR ANO
    if (ano !== null && (!Number.isInteger(ano) || ano < 1 || ano > 2100)) {
      return {
        sucesso: false,
        mensagem: 'Ano de publicação inválido.',
      };
    }

    // VALIDAR PÁGINAS
    if (
      totalPaginas !== null &&
      (!Number.isInteger(totalPaginas) || totalPaginas <= 0)
    ) {
      return {
        sucesso: false,
        mensagem: 'Informe um total de páginas válido.',
      };
    }

    if (!Number.isInteger(paginasLidas) || paginasLidas < 0) {
      return {
        sucesso: false,
        mensagem: 'Informe uma quantidade válida de páginas lidas.',
      };
    }

    if (totalPaginas !== null && paginasLidas > totalPaginas) {
      return {
        sucesso: false,
        mensagem: 'Páginas lidas não podem superar o total.',
      };
    }

    // VALIDAR AVALIAÇÃO
    if (
      avaliacao !== null &&
      (!Number.isInteger(avaliacao) || avaliacao < 1 || avaliacao > 5)
    ) {
      return {
        sucesso: false,
        mensagem: 'A avaliação deve ser de 1 a 5 estrelas.',
      };
    }

    if (comentario.length > 500) {
      return {
        sucesso: false,
        mensagem: 'O comentário pode ter até 500 caracteres.',
      };
    }

    try {
      const livros = lerEstante();

      // NORMALIZAR TEXTO PARA EVITAR DUPLICAÇÕES
      function normalizar(texto) {
        return String(texto || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      // COMPARAR COM OS LIVROS JÁ SALVOS
      const duplicado = livros.some((registro) => {
        const informacoes =
          registro.origem === 'manual'
            ? registro
            : window.LPF_LIVROS?.[registro.id];

        if (!informacoes) return false;

        return (
          normalizar(informacoes.titulo) === normalizar(titulo) &&
          normalizar(informacoes.autor) === normalizar(autor)
        );
      });

      if (duplicado) {
        return {
          sucesso: false,
          mensagem: 'Este livro já está na sua estante.',
        };
      }

      const bloqueio = verificarLimite(livros);

      if (bloqueio) {
        return bloqueio;
      }
      // CRIAR IDENTIFICADOR EXCLUSIVO
      const id = `manual-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

      const novoLivro = {
        id,
        origem: 'manual',
        titulo,
        autor,
        genero,
        ano,
        capa: dados.capa || null,
        status,
        totalPaginas,
        paginasLidas,
        avaliacao,
        comentario,
        adicionadoEm: new Date().toISOString(),
      };

      livros.push(novoLivro);

      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(livros));

      return {
        sucesso: true,
        id,
        mensagem: 'Livro adicionado à sua estante!',
      };
    } catch (erro) {
      console.error('Erro ao cadastrar livro manual:', erro);

      return {
        sucesso: false,
        mensagem:
          'Não foi possível salvar o livro. Verifique o espaço disponível no navegador.',
      };
    }
  }

  // DISPONIBILIZAR AS FUNÇÕES PARA OUTRAS PÁGINAS
  return {
    listar,
    buscar,
    adicionar,
    adicionarManual,
    atualizar,
    remover,
  };
})();
