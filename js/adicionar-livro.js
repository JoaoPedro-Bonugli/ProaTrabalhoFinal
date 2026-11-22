// prévia dinâmica da leitura

document.addEventListener('DOMContentLoaded', () => {
  // CAMPOS DO FORMULÁRIO
  const campoStatus = document.querySelector('#novoStatus');
  const campoTotal = document.querySelector('#novoTotalPaginas');
  const campoLidas = document.querySelector('#novoPaginasLidas');
  const campoAvaliacao = document.querySelector('#novaAvaliacao');

  // ELEMENTOS DA PRÉVIA
  const previewStatus = document.querySelector('#previewStatus');
  const previewPercentual = document.querySelector('#previewPercentual');
  const previewPaginas = document.querySelector('#previewPaginas');
  const previewProgresso = document.querySelector('#previewProgresso');
  const previewBarra = document.querySelector('#previewBarraValor');
  const previewEstrelas = document.querySelector('#previewEstrelas');

  const nomesStatus = {
    'quero-ler': 'Quero Ler',
    lendo: 'Lendo',
    lido: 'Lido',
  };

  function atualizarPrevia() {
    // STATUS
    previewStatus.textContent = nomesStatus[campoStatus.value] || 'Quero Ler';

    // PÁGINAS
    const total = Number(campoTotal.value);
    const lidas = Number(campoLidas.value) || 0;

    const temTotal =
      campoTotal.value !== '' && Number.isFinite(total) && total > 0;

    if (temTotal && lidas >= 0 && lidas <= total) {
      const percentual = Math.round((lidas / total) * 100);

      previewPercentual.textContent = `${percentual}%`;

      previewPaginas.textContent = `${lidas} de ${total} páginas`;

      previewBarra.style.width = `${percentual}%`;

      previewProgresso.setAttribute('aria-valuenow', percentual);

      previewProgresso.removeAttribute('aria-valuetext');
    } else {
      previewPercentual.textContent = '—';
      previewBarra.style.width = '0%';

      const mensagem =
        temTotal && lidas > total
          ? 'Páginas lidas superam o total.'
          : 'Progresso não informado';

      previewPaginas.textContent = mensagem;

      previewProgresso.removeAttribute('aria-valuenow');
      previewProgresso.setAttribute('aria-valuetext', mensagem);
    }

    // AVALIAÇÃO
    const nota = Number(campoAvaliacao.value);

    if (nota >= 1 && nota <= 5) {
      previewEstrelas.textContent = '★'.repeat(nota) + '☆'.repeat(5 - nota);
    } else {
      previewEstrelas.textContent = '☆☆☆☆☆';
    }
  }

  // ATUALIZAR QUANDO OS CAMPOS FOREM ALTERADOS
  campoStatus.addEventListener('change', atualizarPrevia);
  campoTotal.addEventListener('input', atualizarPrevia);
  campoLidas.addEventListener('input', atualizarPrevia);
  campoAvaliacao.addEventListener('change', atualizarPrevia);

  // ESTADO INICIAL
  atualizarPrevia();

  // CADASTRO MANUAL E CAPA DO LIVRO
  const formularioCadastro = document.querySelector('#formAdicionarLivro');

  const campoImagem = document.querySelector('#capaLivro');
  const imagemPreview = document.querySelector('#previewCapa');
  const placeholderCapa = document.querySelector('#capaPlaceholder');
  const mensagemCadastro = document.querySelector('#mensagemCadastro');

  const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp'];

  const tamanhoMaximo = 5 * 1024 * 1024; // 5 MB

  let urlPreview = null;

  // MOSTRAR MENSAGENS DO FORMULÁRIO
  function mostrarMensagem(texto) {
    mensagemCadastro.textContent = texto;
    mensagemCadastro.hidden = false;
  }

  // RESTAURAR A CAPA PADRÃO
  function limparPreviewCapa() {
    if (urlPreview) {
      URL.revokeObjectURL(urlPreview);
      urlPreview = null;
    }

    imagemPreview.hidden = true;
    imagemPreview.removeAttribute('src');
    placeholderCapa.hidden = false;
  }

  // PRÉVIA DA IMAGEM ESCOLHIDA
  campoImagem.addEventListener('change', () => {
    const arquivo = campoImagem.files[0];

    limparPreviewCapa();
    mensagemCadastro.hidden = true;

    if (!arquivo) return;

    if (!tiposPermitidos.includes(arquivo.type)) {
      mostrarMensagem('Escolha uma imagem PNG, JPG ou WEBP.');
      campoImagem.value = '';
      return;
    }

    if (arquivo.size > tamanhoMaximo) {
      mostrarMensagem('A imagem deve ter no máximo 5 MB.');
      campoImagem.value = '';
      return;
    }

    urlPreview = URL.createObjectURL(arquivo);

    imagemPreview.src = urlPreview;
    imagemPreview.hidden = false;
    placeholderCapa.hidden = true;
  });

  // REDUZIR A IMAGEM ANTES DE SALVAR
  function compactarCapa(arquivo) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(arquivo);
      const imagem = new Image();

      imagem.onload = () => {
        try {
          const larguraMaxima = 420;
          const alturaMaxima = 600;

          const escala = Math.min(
            1,
            larguraMaxima / imagem.naturalWidth,
            alturaMaxima / imagem.naturalHeight,
          );

          const canvas = document.createElement('canvas');

          canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));

          canvas.height = Math.max(
            1,
            Math.round(imagem.naturalHeight * escala),
          );

          const contexto = canvas.getContext('2d');

          if (!contexto) {
            throw new Error('Canvas não disponível.');
          }

          // FUNDO BRANCO PARA IMAGENS TRANSPARENTES
          contexto.fillStyle = '#FFFFFF';
          contexto.fillRect(0, 0, canvas.width, canvas.height);

          contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

          let capaCompactada = canvas.toDataURL('image/jpeg', 0.75);

          // SEGUNDA TENTATIVA COM MAIS COMPRESSÃO
          if (capaCompactada.length > 400000) {
            capaCompactada = canvas.toDataURL('image/jpeg', 0.55);
          }

          if (capaCompactada.length > 400000) {
            throw new Error('Imagem muito grande para armazenar.');
          }

          resolve(capaCompactada);
        } catch (erro) {
          reject(erro);
        } finally {
          URL.revokeObjectURL(url);
        }
      };

      imagem.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Não foi possível carregar a imagem.'));
      };

      imagem.src = url;
    });
  }

  // SALVAR LIVRO MANUAL
  formularioCadastro.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensagemCadastro.hidden = true;

    const botaoSalvar = formularioCadastro.querySelector('.adicionar-salvar');

    botaoSalvar.disabled = true;

    try {
      const arquivo = campoImagem.files[0];

      let capa = null;

      if (arquivo) {
        if (
          !tiposPermitidos.includes(arquivo.type) ||
          arquivo.size > tamanhoMaximo
        ) {
          mostrarMensagem('Imagem inválida ou maior que 5 MB.');
          return;
        }

        capa = await compactarCapa(arquivo);
      }

      // RECOLHER OS DADOS DO FORMULÁRIO
      const dadosLivro = {
        titulo: document.querySelector('#novoTitulo').value,
        autor: document.querySelector('#novoAutor').value,
        genero: document.querySelector('#novoGenero').value,
        ano: document.querySelector('#novoAno').value,
        status: campoStatus.value,
        totalPaginas: campoTotal.value,
        paginasLidas: campoLidas.value,
        avaliacao: campoAvaliacao.value,
        comentario: document.querySelector('#novoComentario').value,
        capa,
      };

      const resultado = window.LPF_ESTANTE.adicionarManual(dadosLivro);

      if (!resultado.sucesso) {
        mostrarMensagem(resultado.mensagem);
        return;
      }

      // ABRIR A ESTANTE APÓS O CADASTRO
      window.location.href = 'MinhaEstante.html';
    } catch (erro) {
      console.error('Erro no cadastro:', erro);

      mostrarMensagem('Não foi possível processar a imagem ou salvar o livro.');
    } finally {
      botaoSalvar.disabled = false;
    }
  });
});
