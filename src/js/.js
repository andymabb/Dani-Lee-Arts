// Generic navigation active state management
// Works with any site using .mainnav and .footer-nav classes
(function() {
    'use strict';
    
    function setActiveNavigation() {
        // Get current page information
        var currentPath = window.location.pathname;
        var currentPage = currentPath.split('/').pop();
        
        // Handle different scenarios for home page detection
        var isHomePage = currentPath === '/' || 
                        currentPage === '' || 
                        currentPage === 'index.html' || 
                        currentPage === 'index.htm' || 
                        currentPage === 'index.php';
        
        // Function to check if a link matches the current page
        function isLinkActive(href) {
            // Handle relative URLs starting with './'
            if (href === './' || href === './index.html') {
                return isHomePage;
            }
            
            // Handle absolute home references
            if (href === '/' || href === '/index.html') {
                return isHomePage;
            }
            
            // Extract filename from href for comparison
            var linkPage = href.split('/').pop().split('#')[0]; // Remove hash fragments
            
            // Direct filename match
            if (linkPage === currentPage) {
                return true;
            }
            
            // Handle index page variations
            if (isHomePage && (linkPage === 'index.html' || linkPage === 'index.htm' || linkPage === 'index.php')) {
                return true;
            }
            
            return false;
        }
        
        // Update navigation links
        function updateNavigation(selector) {
            var navLinks = document.querySelectorAll(selector + ' a');
            navLinks.forEach(function(link) {
                link.classList.remove('active');
                var href = link.getAttribute('href');
                
                if (href && isLinkActive(href)) {
                    link.classList.add('active');
                }
            });
        }
        
        // Apply to main navigation
        updateNavigation('.mainnav');
        
        // Apply to footer navigation
        updateNavigation('.footer-nav');
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setActiveNavigation);
    } else {
        setActiveNavigation();
    }
})();
