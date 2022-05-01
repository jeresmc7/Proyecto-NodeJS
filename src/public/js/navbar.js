$('.menu-toggle').click(function() {
  
    $('.site-navbar').toggleClass('site-navbar--open', 500);
    $(this).toggleClass('open');
    
  })

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            // navbarCollapsible.classList.remove('navbar-shrink')
            navbarCollapsible.classList.add('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate SimpleLightbox plugin for portfolio items
    // new SimpleLightbox({
    //     elements: '#portfolio a.portfolio-box'
    // });

});