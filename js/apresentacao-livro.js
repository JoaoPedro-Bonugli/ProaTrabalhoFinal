/*apresentação dinâmica do livro*/

document.addEventListener("DOMContentLoaded", () => {

    // LER O IDENTIFICADOR PRESENTE NA URL
    const parametros = new URLSearchParams(window.location.search);
    const idLivro = parametros.get("livro") || "dom-casmurro";

    // ACESSAR O CATÁLOGO COMPARTILHADO
    const catalogo = window.LPF_LIVROS;

    if (
        !catalogo ||
        !Object.prototype.hasOwnProperty.call(catalogo, idLivro)
    ) {
        const card = document.querySelector(".apresentacao-card");
        const inferior = document.querySelector(".apresentacao-inferior");

        if (card) card.style.display = "none";
        if (inferior) inferior.style.display = "none";

        const mensagem = document.createElement("p");
        mensagem.textContent =
            "Livro não encontrado. Volte para Descobrir e escolha outra obra.";

        document.querySelector(".apresentacao-main")
            .appendChild(mensagem);

        return;
    }

    const livro = catalogo[idLivro];

    // ATUALIZAR TÍTULO E AUTOR
    document.querySelector("#apresentacaoTitulo").textContent =
        livro.titulo;

    document.querySelector("#apresentacaoAutor").textContent =
        livro.autor;

    // ATUALIZAR CAPA
    const capa = document.querySelector("#apresentacaoCapa");

    capa.src = livro.capa;
    capa.alt = `Capa do livro ${livro.titulo}`;

    // ATUALIZAR INFORMAÇÕES
    document.querySelector("#apresentacaoGenero").textContent =
        livro.genero;

    document.querySelector("#apresentacaoAno").textContent =
        livro.ano;

    document.querySelector("#apresentacaoIdioma").textContent =
        livro.idioma;

    document.querySelector(".apresentacao-etiqueta").textContent =
        livro.etiqueta;

    document.querySelector(".detalhe-item small").textContent =
        livro.subgenero;

    // ATUALIZAR DESCRIÇÃO E SINOPSE
    document.querySelector(".apresentacao-descricao").textContent =
        livro.descricao;

    document.querySelector("#sinopseLivro").textContent =
        livro.sinopse;

    // ATUALIZAR TÍTULO DA ABA DO NAVEGADOR
    document.title = `${livro.titulo} | LPF`;

});