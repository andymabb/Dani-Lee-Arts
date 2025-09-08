// This script will automatically find all project galleries on the page.
		document.addEventListener('DOMContentLoaded', () => {
			const projectArticles = document.querySelectorAll('article');
			projectArticles.forEach(article => {
				const galleryId = article.getAttribute('id');
				if (galleryId) {
					GLightbox({
						selector: `#${galleryId} .gallery a, #${galleryId} .lightbox-text`,
						gallery: galleryId
					});
				}
			});
		});