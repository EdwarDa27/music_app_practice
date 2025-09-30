

class ListView {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentSort = 'name-asc';
        this.init();
    }

    async init() {
        console.log('📋 Inicializando vista de lista...');
        
       
        gamesAPI.on('dataLoaded', (games) => {
            console.log('📦 Juegos recibidos en vista lista:', games);
            this.games = games;
            this.filteredGames = games;
            this.renderGames();
            this.setupEventListeners();
            this.populateFilters();
        });

        
        gamesAPI.on('cartUpdated', (cart) => {
            this.updateCartBadge();
        });

       
        gamesAPI.on('favoritesUpdated', () => {
            this.renderGames();
        });

      
        console.log('🔄 Obteniendo juegos de la API...');
        const initialGames = gamesAPI.getAllGames();
        console.log('🎯 Juegos iniciales en lista:', initialGames);
        
        this.filteredGames = initialGames;
        this.renderGames();
        this.setupEventListeners();
        this.updateCartBadge();
        this.populateFilters();
    }

    populateFilters() {
        console.log('⚙️ Poblando filtros en lista...');
        
        const categories = gamesAPI.getCategories();
        console.log('📊 Categorías:', categories);
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                categoryFilter.appendChild(option);
            });
        }

       
        const platforms = gamesAPI.getPlatforms();
        console.log('🎯 Plataformas:', platforms);
        
        const platformFilter = document.getElementById('platformFilter');
        if (platformFilter) {
            platforms.forEach(platform => {
                const option = document.createElement('option');
                option.value = platform;
                option.textContent = platform;
                platformFilter.appendChild(option);
            });
        }
    }

    renderGames() {
        const gamesList = document.getElementById('gamesList');
        if (!gamesList) {
            console.error('❌ No se encontró el contenedor gamesList');
            return;
        }

        console.log('📝 Renderizando lista de juegos:', this.filteredGames.length);
        gamesList.innerHTML = '';

        if (this.filteredGames.length === 0) {
            gamesList.innerHTML = '<div class="no-games">No se encontraron juegos</div>';
            console.log('📭 No hay juegos para mostrar en lista');
            return;
        }

        const sortedGames = gamesAPI.sortGames(this.filteredGames, this.currentSort);
        console.log('🔄 Juegos ordenados en lista:', sortedGames);

        sortedGames.forEach(game => {
            console.log('➕ Añadiendo juego a lista:', game.title);
            const finalPrice = gamesAPI.getFinalPrice(game);
            const originalPrice = game.discount > 0 ? `<span class="original-price">$${game.price.toFixed(2)}</span>` : '';
            const discountBadge = game.discount > 0 ? `<div class="discount-badge">-${game.discount}%</div>` : '';
            const stockStatus = game.inStock ? 
                '<span class="in-stock">✓ En stock</span>' : 
                '<span class="out-of-stock">✗ Agotado</span>';

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="game-info">
                    <div class="game-icon">${game.icon}</div>
                    <div class="game-details">
                        <div class="game-title">${game.title}</div>
                        <div class="game-meta">
                            <div class="game-platforms">
                                ${game.platform.map(p => `<span class="platform-tag">${p}</span>`).join('')}
                            </div>
                            <div class="game-rating">
                                ${'★'.repeat(Math.floor(game.rating))}${'☆'.repeat(5-Math.floor(game.rating))} (${game.rating})
                            </div>
                        </div>
                        <div class="game-description">${game.description}</div>
                    </div>
                </div>
                
                <div class="game-details-right">
                    <div class="game-price-section">
                        <div>
                            ${originalPrice}
                            <span class="final-price">$${finalPrice.toFixed(2)}</span>
                        </div>
                        ${discountBadge}
                    </div>
                    <div class="game-stock">${stockStatus}</div>
                    <div class="game-actions">
                        <button class="btn-favorite ${gamesAPI.isFavorite(game.id) ? 'favorited' : ''}" 
                                onclick="listView.toggleFavorite(${game.id})">
                            ♥ Favorito
                        </button>
                        <button class="btn-add-cart ${!game.inStock ? 'disabled' : ''}" 
                                onclick="listView.addToCart(${game.id})"
                                ${!game.inStock ? 'disabled' : ''}>
                            🛒 Añadir
                        </button>
                    </div>
                </div>
            `;
            gamesList.appendChild(listItem);
        });
        
        console.log('✅ Lista renderizada completada');
    }

    setupEventListeners() {
        console.log('🔗 Configurando event listeners en lista...');
        
        const categoryFilter = document.getElementById('categoryFilter');
        const platformFilter = document.getElementById('platformFilter');
        const priceFilter = document.getElementById('priceFilter');
        const stockFilter = document.getElementById('stockFilter');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.applyFilters());
        }
        if (platformFilter) {
            platformFilter.addEventListener('change', (e) => this.applyFilters());
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => this.applyFilters());
        }
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => this.applyFilters());
        }
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.applyFilters());
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderGames();
            });
        }
    }

    applyFilters() {
        const filters = {
            category: document.getElementById('categoryFilter')?.value || 'all',
            platform: document.getElementById('platformFilter')?.value || 'all',
            priceRange: document.getElementById('priceFilter')?.value || 'all',
            inStock: document.getElementById('stockFilter')?.checked || false,
            search: document.getElementById('searchInput')?.value || ''
        };

        console.log('🔍 Aplicando filtros en lista:', filters);
        this.filteredGames = gamesAPI.getFilteredGames(filters);
        console.log('🎯 Juegos filtrados en lista:', this.filteredGames);
        this.renderGames();
    }

    addToCart(gameId) {
        console.log('🛒 Añadiendo al carrito desde lista:', gameId);
        const success = gamesAPI.addToCart(gameId);
        if (success) {
            this.showNotification('Juego añadido al carrito', 'success');
        }
    }

    toggleFavorite(gameId) {
        console.log('❤️ Toggle favorito desde lista:', gameId);
        const isNowFavorite = gamesAPI.toggleFavorite(gameId);
        this.showNotification(
            isNowFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos', 
            'info'
        );
    }

    updateCartBadge() {
        const cart = gamesAPI.getCart();
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = cartCount;
            badge.style.display = cartCount > 0 ? 'flex' : 'none';
        }
    }

    showNotification(message, type = 'info') {
      
        console.log(`📢 ${type}: ${message}`);
        alert(`${type.toUpperCase()}: ${message}`);
    }

    viewCart() {
        const cart = gamesAPI.getCart();
        if (cart.length === 0) {
            alert('🛒 El carrito está vacío');
        } else {
            const total = gamesAPI.getCartTotal();
            const cartItems = cart.map(item => 
                `• ${item.title} x${item.quantity} - $${(item.finalPrice * item.quantity).toFixed(2)}`
            ).join('\n');
            
            alert(`🛒 Carrito:\n${cartItems}\n\nTotal: $${total.toFixed(2)}`);
        }
    }
}


const listView = new ListView();


function viewCart() {
    listView.viewCart();
}

function toggleFavorite(gameId) {
    listView.toggleFavorite(gameId);
}

function addToCart(gameId) {
    listView.addToCart(gameId);
}

console.log('📋 ListView cargado');