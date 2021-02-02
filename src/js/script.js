const menuButton = document.querySelector('.menu-btn'),
      menu = document.querySelector('.header');  

menuButton.addEventListener('click', (e) => {
    menuButton.classList.toggle('menu-btn-active');
    menu.classList.toggle('header-active');
});