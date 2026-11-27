/*LPF - menu de navegação responsivo*/

document.addEventListener('DOMContentLoaded', () => {
  const botaoMenu = document.querySelector('#botaoMenu');
  const menu = document.querySelector('#menuPrincipal');

  if (!botaoMenu || !menu) {
    return;
  }

  function fecharMenu() {
    menu.classList.remove('aberto');

    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.setAttribute('aria-label', 'Abrir menu de navegação');
  }

  // abre e fecha
  botaoMenu.addEventListener('click', () => {
    const estaAberto = menu.classList.toggle('aberto');

    botaoMenu.setAttribute('aria-expanded', String(estaAberto));

    botaoMenu.setAttribute(
      'aria-label',
      estaAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação',
    );
  });

  // fechar ao selecionar uma página
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', fecharMenu);
  });

  // fechar ao apertar ESC
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
      fecharMenu();
      botaoMenu.focus();
    }
  });

  // fechar ao apertar fora
  document.addEventListener('click', (evento) => {
    if (!menu.contains(evento.target) && !botaoMenu.contains(evento.target)) {
      fecharMenu();
    }
  });

  // fechar quando volta ao computer
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      fecharMenu();
    }
  });
});

// MARCAR PÁGINA ATUAL NO MENU
const linksMenu = document.querySelectorAll(".menu a");

linksMenu.forEach(function(link) {
  // Tira o marcado de todos
  link.removeAttribute("aria-current");

  // Se o link for igual a página que estou agora, marca ele
  if (link.href === window.location.href) {
    link.setAttribute("aria-current", "page");
  }
});
