// Navigation active state management
(function() {
    'use strict';
    
    function setActiveNavigation() {
        // Get current page filename
        var currentPage = window.location.pathname.split('/').pop();
        
        // Handle index page - could be empty string, 'index.html', or just '/'
        if (currentPage === '' || currentPage === 'index.html' || window.location.pathname === '/') {
            currentPage = 'index.html';
        }
        
        // Determine which navigation item should be active
        var targetHref;
        
        if (currentPage === 'index.html' || currentPage === '') {
            targetHref = './';
        } else if (currentPage.startsWith('portfolio')) {
            // Any page starting with "portfolio" (portfolio1.html, portfolio2.html, portfolio3.html, etc.)
            targetHref = 'portfolio1.html';
        } else if (currentPage === 'about.html') {
            targetHref = 'about.html';
        } else if (currentPage === 'news.html') {
            targetHref = 'news.html';
        } else if (currentPage === 'booking.html') {
            targetHref = 'booking.html';
        }
        
        if (targetHref) {
            // Find and set active class for main navigation
            var mainNavLinks = document.querySelectorAll('.mainnav a');
            mainNavLinks.forEach(function(link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === targetHref) {
                    link.classList.add('active');
                }
            });
            
            // Find and set active class for footer navigation
            var footerNavLinks = document.querySelectorAll('.footer-nav a');
            footerNavLinks.forEach(function(link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === targetHref) {
                    link.classList.add('active');
                }
            });
        }
        
        // Handle page-links for portfolio pages
        if (currentPage.startsWith('portfolio')) {
            var pageLinks = document.querySelectorAll('.page-links a');
            pageLinks.forEach(function(link) {
                link.classList.remove('active');
                // Check if the link href matches the current page
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setActiveNavigation);
    } else {
        setActiveNavigation();
    }
})();
