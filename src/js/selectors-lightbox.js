// This script will automatically find all project galleries on the page.
		document.addEventListener('DOMContentLoaded', () => {
			let lastFocusedElement = null;
			
			const projectArticles = document.querySelectorAll('article');
			projectArticles.forEach(article => {
				const galleryId = article.getAttribute('id');
				if (galleryId) {
					const lightbox = GLightbox({
						selector: `#${galleryId} .gallery a, #${galleryId} .lightbox-text`,
						gallery: galleryId,
						touchNavigation: true,
						closeOnOutsideClick: true
					});
					
					// Store the active element before opening
					lightbox.on('open', () => {
						lastFocusedElement = document.activeElement;
					});
					
					// Return focus to the last focused element
					lightbox.on('close', () => {
						if (lastFocusedElement) {
							setTimeout(() => {
								lastFocusedElement.focus();
							}, 100);
						}
					});
				}
			});
		});
