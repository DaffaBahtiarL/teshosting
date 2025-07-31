  // Navigation
    document.addEventListener('DOMContentLoaded', () => {
      const tvKnobs = document.querySelectorAll('.tv-knob');
      const pages = document.querySelectorAll('.page-container');
      
      // Set up navigation
      tvKnobs.forEach(knob => {
        knob.addEventListener('click', () => {
          const pageId = knob.getAttribute('data-page');
          
          // Update active knob
          tvKnobs.forEach(k => k.classList.remove('active'));
          knob.classList.add('active');
          
          // Show selected page with TV static transition
          pages.forEach(page => {
            if (page.id === pageId) {
              page.classList.add('page-active');
              // Add page to history for back/forward navigation
              history.pushState({ page: pageId }, '', `#${pageId}`);
            } else {
              page.classList.remove('page-active');
            }
          });
        });
      });
      
      // Handle browser back/forward navigation
      window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
          const pageId = event.state.page;
          
          // Update active knob
          tvKnobs.forEach(k => {
            if (k.getAttribute('data-page') === pageId) {
              k.classList.add('active');
            } else {
              k.classList.remove('active');
            }
          });
          
          // Show selected page
          pages.forEach(page => {
            page.classList.toggle('page-active', page.id === pageId);
          });
        }
      });
      
      // Set initial state
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById(hash)) {
        tvKnobs.forEach(k => {
          if (k.getAttribute('data-page') === hash) {
            k.click();
          }
        });
      } else {
        history.replaceState({ page: 'intro' }, '', '#intro');
      }
      
      // Character Trivia API
      const triviaButtons = document.querySelectorAll('.trivia-btn');
      triviaButtons.forEach(button => {
        button.addEventListener('click', async () => {
          const character = button.getAttribute('data-character');
          const contentDiv = button.nextElementSibling;
          
          // Show spinner
          contentDiv.classList.remove('hidden');
          
          // Simulate API call
          setTimeout(() => {
            const triviaContent = getCharacterTrivia(character);
            contentDiv.innerHTML = `
              <div class="bg-blue-100 p-4 rounded">
                <h4 class="font-bold mb-2">Did you know?</h4>
                <p>${triviaContent}</p>
              </div>
            `;
          }, 1000);
        });
      });
      
      // Gallery Image API
      const galleryGrid = document.getElementById('gallery-grid');
      const gallerySpinner = document.getElementById('gallery-spinner');
      
      // Load gallery images when gallery page is shown
      document.querySelector('[data-page="gallery"]').addEventListener('click', () => {
        if (galleryGrid.children.length <= 1) {
          loadGalleryImages();
        }
      });
      
      // Image Upload Preview
      const imageUpload = document.getElementById('image-upload');
      const previewContainer = document.querySelector('.preview-container');
      const previewImg = document.getElementById('preview-img');
      const submitUpload = document.getElementById('submit-upload');
      
      imageUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          
          // Check file size (25MB limit)
          if (file.size > 25 * 1024 * 1024) {
            alert('File size exceeds 25MB limit.');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            previewContainer.classList.remove('hidden');
          };
          reader.readAsDataURL(file);
        }
      });
      
      // Handle image upload submission
      submitUpload.addEventListener('click', () => {
        const caption = document.getElementById('image-caption').value;
        if (!caption) {
          alert('Please add a caption for your image.');
          return;
        }
        
        // Save to LocalStorage
        const userUploads = JSON.parse(localStorage.getItem('trumanShowUploads') || '[]');
        userUploads.push({
          id: Date.now(),
          src: previewImg.src,
          caption: caption,
          comments: [],
          favorite: false
        });
        localStorage.setItem('trumanShowUploads', JSON.stringify(userUploads));
        
        // Reset form
        previewContainer.classList.add('hidden');
        document.getElementById('image-caption').value = '';
        imageUpload.value = '';
        
        // Reload gallery
        loadGalleryImages();
      });
      
      // Comment Modal
      const commentModal = document.getElementById('comment-modal');
      const closeModalBtn = document.querySelector('.close-modal');
      const submitCommentBtn = document.getElementById('submit-comment');
      let currentImageId = null;
      
      // Close modal when clicking X
      closeModalBtn.addEventListener('click', () => {
        commentModal.classList.remove('show');
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === commentModal) {
          commentModal.classList.remove('show');
        }
      });
      
      // Submit comment
      submitCommentBtn.addEventListener('click', () => {
        const commentText = document.getElementById('comment-input').value;
        if (!commentText) return;
        
        const isFavorite = document.getElementById('favorite-checkbox').checked;
        
        // Get storage data
        const allImages = JSON.parse(localStorage.getItem('trumanShowGallery') || '[]');
        const userUploads = JSON.parse(localStorage.getItem('trumanShowUploads') || '[]');
        
        // Find image in either storage
        const galleryImage = allImages.find(img => img.id === currentImageId);
        const uploadImage = userUploads.find(img => img.id === currentImageId);
        
        // Add comment and update storage
        if (galleryImage) {
          if (!galleryImage.comments) galleryImage.comments = [];
          galleryImage.comments.push({
            text: commentText,
            date: new Date().toISOString()
          });
          galleryImage.favorite = isFavorite;
          localStorage.setItem('trumanShowGallery', JSON.stringify(allImages));
        } else if (uploadImage) {
          if (!uploadImage.comments) uploadImage.comments = [];
          uploadImage.comments.push({
            text: commentText,
            date: new Date().toISOString()
          });
          uploadImage.favorite = isFavorite;
          localStorage.setItem('trumanShowUploads', JSON.stringify(userUploads));
        }
        
        // Update modal with new comment
        updateCommentsInModal(currentImageId);
        
        // Clear form
        document.getElementById('comment-input').value = '';
        document.getElementById('favorite-checkbox').checked = false;
      });
    });
    
    // Functions
    function getCharacterTrivia(character) {
      const triviaMap = {
        'truman': "Jim Carrey prepared for his role by isolating himself from the public and watching episodes of 'The Twilight Zone' for inspiration.",
        'christof': "Ed Harris, who played Christof, was nominated for an Academy Award for Best Supporting Actor for his role in the film.",
        'meryl': "Laura Linney (Meryl) based her performance on 1950s sitcom housewives and TV commercial actresses.",
        'marlon': "Noah Emmerich (Marlon) has said that the scene where he tells Truman about his father's return was the most challenging of his career.",
        'sylvia': "Natascha McElhone (Sylvia/Lauren) had to film all her scenes in just two weeks due to scheduling conflicts.",
        'kirk': "Brian Delate, who played Kirk Burbank, also appeared in another film questioning reality - 'The Manchurian Candidate'."
      };
      return triviaMap[character] || "This is a prototype, continue building to see the full version.";
    }
    
    function loadGalleryImages() {
      const galleryGrid = document.getElementById('gallery-grid');
      const gallerySpinner = document.getElementById('gallery-spinner');
      
      // Show spinner
      gallerySpinner.classList.remove('hidden');
      galleryGrid.innerHTML = '';
      
      // Simulate API call delay
      setTimeout(() => {
        // Get saved gallery items or create initial ones
        let savedGallery = JSON.parse(localStorage.getItem('trumanShowGallery') || '[]');
        if (savedGallery.length === 0) {
          // Initial gallery images
          savedGallery = [
            {
              id: 1,
              src: "https://cdn.pixabay.com/photo/2017/08/27/23/55/water-2687752_1280.jpg",
              caption: "Truman attempting to overcome his fear of water",
              comments: [],
              favorite: false
            },
            {
              id: 2,
              src: "https://cdn.pixabay.com/photo/2019/03/21/09/25/eyes-4069766_1280.jpg",
              caption: "Christof watching Truman through hidden cameras",
              comments: [],
              favorite: false
            },
            {
              id: 3,
              src: "https://cdn.pixabay.com/photo/2017/08/24/21/41/door-2678562_1280.jpg",
              caption: "The exit door - 'In case I don't see ya, good afternoon, good evening, and good night!'",
              comments: [],
              favorite: false
            },
            {
              id: 4,
              src: "https://cdn.pixabay.com/photo/2019/08/26/22/01/sunrise-4433375_1280.jpg",
              caption: "The artificial sunrise in Seahaven",
              comments: [],
              favorite: false
            },
            {
              id: 5,
              src: "https://cdn.pixabay.com/photo/2017/12/17/21/44/boat-3025132_1280.jpg",
              caption: "Truman's final journey across the 'sea'",
              comments: [],
              favorite: false
            },
            {
              id: 6,
              src: "https://cdn.pixabay.com/photo/2016/07/29/20/46/couple-1555489_1280.jpg",
              caption: "Truman and Meryl - the perfect television couple",
              comments: [],
              favorite: false
            }
          ];
          localStorage.setItem('trumanShowGallery', JSON.stringify(savedGallery));
        }
        
        // Get user uploads
        const userUploads = JSON.parse(localStorage.getItem('trumanShowUploads') || '[]');
        
        // Combine both galleries
        const allImages = [...savedGallery, ...userUploads];
        
        // Add images to gallery
        allImages.forEach(image => {
          const gridItem = document.createElement('div');
          gridItem.className = 'grid-item';
          
          const favoriteIcon = image.favorite ? 
            '<i class="fas fa-heart text-red-500"></i>' : 
            '<i class="far fa-heart"></i>';
            
          gridItem.innerHTML = `
            <div class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div class="crt-frame" style="border-width: 6px;">
                <div class="crt-content">
                  <img src="${image.src}" alt="${image.caption}" class="w-full">
                </div>
              </div>
              <div class="p-4">
                <p class="text-gray-700">${image.caption}</p>
                <div class="flex justify-between items-center mt-3">
                  <button class="comment-btn text-blue-700 hover:text-blue-900" data-id="${image.id}">
                    <i class="far fa-comment"></i> ${image.comments ? image.comments.length : 0} Comments
                  </button>
                  <span class="favorite-indicator">${favoriteIcon}</span>
                </div>
              </div>
            </div>
          `;
          galleryGrid.appendChild(gridItem);
        });
        
        // Initialize masonry layout
        const msnry = new Masonry(galleryGrid, {
          itemSelector: '.grid-item',
          columnWidth: '.grid-item',
          percentPosition: true,
          gutter: 20
        });
        
        // Reload layout after images load
        imagesLoaded(galleryGrid).on('progress', () => {
          msnry.layout();
        });
        
        // Hide spinner
        gallerySpinner.classList.hidden = true;
        
        // Add click listeners for comments
        document.querySelectorAll('.comment-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const imageId = parseInt(e.currentTarget.getAttribute('data-id'));
            openCommentModal(imageId);
          });
        });
      }, 1000);
    }
    
    function openCommentModal(imageId) {
      const modal = document.getElementById('comment-modal');
      const modalTitle = document.getElementById('modal-title');
      currentImageId = imageId;
      
      // Find image in either gallery or uploads
      const allImages = JSON.parse(localStorage.getItem('trumanShowGallery') || '[]');
      const userUploads = JSON.parse(localStorage.getItem('trumanShowUploads') || '[]');
      
      const image = allImages.find(img => img.id === imageId) || userUploads.find(img => img.id === imageId);
      
      if (image) {
        modalTitle.textContent = `Comments - ${image.caption}`;
        document.getElementById('favorite-checkbox').checked = image.favorite;
        
        // Update comments
        updateCommentsInModal(imageId);
      }
      
      modal.classList.add('show');
    }
    
    function updateCommentsInModal(imageId) {
      const commentsContainer = document.getElementById('comments-container');
      
      // Find image in either gallery or uploads
      const allImages = JSON.parse(localStorage.getItem('trumanShowGallery') || '[]');
      const userUploads = JSON.parse(localStorage.getItem('trumanShowUploads') || '[]');
      
      const image = allImages.find(img => img.id === imageId) || userUploads.find(img => img.id === imageId);
      
      if (image && image.comments && image.comments.length > 0) {
        let commentsHTML = '';
        image.comments.forEach(comment => {
          const date = new Date(comment.date).toLocaleDateString();
          commentsHTML += `
            <div class="bg-gray-50 p-3 rounded mb-2">
              <p>${comment.text}</p>
              <small class="text-gray-500">${date}</small>
            </div>
          `;
        });
        commentsContainer.innerHTML = commentsHTML;
      } else {
        commentsContainer.innerHTML = '<p class="text-gray-500 italic">No comments yet. Be the first to comment!</p>';
      }}