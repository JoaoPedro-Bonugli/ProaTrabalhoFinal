document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTOS DO HTML
    const formulario = document.querySelector("#formBuscaLivro");
    const campoBusca = document.querySelector("#buscarLivro");
    const filtroGenero = document.querySelector("#filtrarGenero");
    const gradeLivros = document.querySelector("#gradeLivros");
    const mensagemBusca = document.querySelector("#mensagemBusca");
    const areaVerMais = document.querySelector(".area-ver-mais");
    const botaoVerMais = document.querySelector("#verMaisLivros");

    if (
        !formulario ||
        !campoBusca ||
        !filtroGenero ||
        !gradeLivros ||
        !mensagemBusca ||
        !areaVerMais ||
        !botaoVerMais
    ) {
        console.error("Elementos da página Descobrir não encontrados.");
        return;
    }

    // LIVROS ADICIONAIS
    const livrosExtras = [
        {
            id: "hipotese-do-amor",
            titulo: "A Hipótese do Amor",
            autor: "Ali Hazelwood",
            genero: "Romance contemporâneo",
            generos: ["romance"],
            imagem: "../assets/1_HOME_1/A Hipótese do Amor – Ali Hazelwood 1.png"
        },
        {
            id: "sete-maridos-evelyn-hugo",
            titulo: "Os Sete Maridos de Evelyn Hugo",
            autor: "Taylor Jenkins Reid",
            genero: "Romance",
            generos: ["romance", "ficcao"],
            imagem: "../assets/1_HOME_1/Os sete maridos de Evelyn Hugo 1.png"
        },
        {
            id: "biblioteca-meia-noite",
            titulo: "A Biblioteca da Meia-Noite",
            autor: "Matt Haig",
            genero: "Ficção",
            generos: ["ficcao", "fantasia"],
            imagem: "../assets/1_HOME_1/a-biblioteca-da-meia-noite-1_jpg (1200×1743) 1.png"
        },
        {
            id: "estilhaca-me",
            titulo: "Estilhaça-me",
            autor: "Tahereh Mafi",
            genero: "Ficção distópica",
            generos: ["ficcao", "fantasia"],
            imagem: "../assets/1_HOME_1/Tahereh Mafi - Estilhaça-me Vol_ 01 - Estilhaça-me 1.png"
        }
    ];

    let extrasVisiveis = false;

    // CRIAR UM CARD DE LIVRO
    function criarCard(livro) {

        const card = document.createElement("article");
        card.className = "livro-card";
        card.dataset.id = livro.id;
        card.dataset.generos = livro.generos.join(",");
        card.dataset.extra = "true";
        card.hidden = true;

        const capa = document.createElement("img");
        capa.className = "livro-capa";
        capa.src = livro.imagem;
        capa.alt = `Capa de ${livro.titulo}`;
        capa.loading = "lazy";

        const dados = document.createElement("div");
        dados.className = "livro-dados";

        const titulo = document.createElement("h3");
        titulo.className = "livro-titulo";
        titulo.textContent = livro.titulo;

        const autor = document.createElement("p");
        autor.className = "livro-autor";
        autor.textContent = livro.autor;

        dados.append(titulo, autor);

        const botao = document.createElement("a");
        botao.className = "livro-botao";
        botao.href = `ApresentacaoLivro.html?livro=${livro.id}`;
        botao.textContent = "Ver livro";

        const genero = document.createElement("p");
        genero.className = "livro-genero";
        genero.textContent = livro.genero;

        card.append(capa, dados, botao, genero);

        return card;
    }

    // ADICIONAR OS QUATRO CARDS À GRADE
    const fragmento = document.createDocumentFragment();

    livrosExtras.forEach((livro) => {
        fragmento.appendChild(criarCard(livro));
    });

    gradeLivros.appendChild(fragmento);

    // NORMALIZAR TEXTOS
    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    // PESQUISAR E FILTRAR LIVROS
    function filtrarLivros() {

        const pesquisa = normalizarTexto(campoBusca.value);
        const generoSelecionado = filtroGenero.value;

        const filtrosAtivos =
            pesquisa !== "" || generoSelecionado !== "todos";

        let livrosEncontrados = 0;

        const cards = document.querySelectorAll(".livro-card");

        cards.forEach((card) => {

            const titulo = card.querySelector(".livro-titulo").textContent;
            const autor = card.querySelector(".livro-autor").textContent;

            const textoLivro = normalizarTexto(`${titulo} ${autor}`);

            const generos = (card.dataset.generos || "")
                .split(",")
                .map(genero => genero.trim());

            const correspondePesquisa = textoLivro.includes(pesquisa);

            const correspondeGenero =
                generoSelecionado === "todos" ||
                generos.includes(generoSelecionado);

            // Durante uma pesquisa, considerar todos os livros.
            // Sem filtros, os extras aparecem apenas após o clique.
            const podeExibir =
                filtrosAtivos ||
                extrasVisiveis ||
                card.dataset.extra !== "true";

            const exibirLivro =
                correspondePesquisa &&
                correspondeGenero &&
                podeExibir;

            card.hidden = !exibirLivro;

            if (exibirLivro) {
                livrosEncontrados++;
            }
        });

        // MENSAGEM DE NENHUM RESULTADO
        mensagemBusca.hidden = livrosEncontrados > 0;

        // EXIBIÇÃO DO BOTÃO VER MAIS
        areaVerMais.hidden =
            filtrosAtivos ||
            extrasVisiveis ||
            livrosExtras.length === 0;
    }

    // LUPA E TECLA ENTER
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        filtrarLivros();
    });

    // PESQUISA ENQUANTO DIGITA
    campoBusca.addEventListener("input", filtrarLivros);

    // FILTRO DE GÊNERO
    filtroGenero.addEventListener("change", filtrarLivros);

    // BOTÃO VER MAIS
    botaoVerMais.addEventListener("click", () => {
        extrasVisiveis = true;
        filtrarLivros();
    });

    // EXIBIÇÃO INICIAL
    filtrarLivros();

});