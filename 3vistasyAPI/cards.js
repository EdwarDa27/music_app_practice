class CardsView {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentSort = 'name-asc';
        this.init();
    }

    async init() {
        console.log('🎮 Inicializando vista visual...');
        
        gamesAPI.on('dataLoaded', (games) => {
            console.log('📦 Juegos recibidos en vista visual:', games);
            this.games = games;
            this.filteredGames = games;
            this.renderGames();
            this.setupEventListeners();
        });

        gamesAPI.on('cartUpdated', (cart) => {
            this.updateCartBadge();
        });

        gamesAPI.on('favoritesUpdated', () => {
            this.renderGames();
        });

        const initialGames = gamesAPI.getAllGames();
        this.filteredGames = initialGames;
        this.renderGames();
        this.setupEventListeners();
        this.updateCartBadge();
    }

    renderGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) return;

        gamesGrid.innerHTML = '';

        if (this.filteredGames.length === 0) {
            gamesGrid.innerHTML = '<div class="no-games">No se encontraron juegos</div>';
            return;
        }

        const sortedGames = gamesAPI.sortGames(this.filteredGames, this.currentSort);

        sortedGames.forEach(game => {
            const finalPrice = gamesAPI.getFinalPrice(game);
            const originalPrice = game.discount > 0 ? 
                `<div class="original-price">$${game.price.toFixed(2)}</div>` : '';
            const discountBadge = game.discount > 0 ? 
                `<div class="discount-badge">-${game.discount}%</div>` : '';
            const stockBadge = game.inStock ? 
                '<div class="stock-badge in-stock">EN STOCK</div>' : 
                '<div class="stock-badge out-of-stock">AGOTADO</div>';

            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <div class="game-image" style="background-image: url('${game.image}?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')">
                    ${discountBadge}
                    ${stockBadge}
                </div>
                
                <div class="game-content">
                    <div class="game-header">
                        <div style="flex: 1;">
                            <div class="game-title">${game.title}</div>
                            <div class="game-rating">
                                ${'★'.repeat(Math.floor(game.rating))}${'☆'.repeat(5-Math.floor(game.rating))}
                                <span>${game.rating}</span>
                            </div>
                        </div>
                        <div class="game-icon">${game.icon}</div>
                    </div>
                    
                    <div class="game-description">
                        ${game.description}
                    </div>
                    
                    <div class="game-platforms">
                        ${game.platform.map(p => `<span class="platform-tag">${p}</span>`).join('')}
                    </div>
                    
                    <div class="game-footer">
                        <div class="game-price">
                            ${originalPrice}
                            <div class="final-price">$${finalPrice.toFixed(2)}</div>
                        </div>
                        <div class="game-actions">
                            <button class="btn-favorite ${gamesAPI.isFavorite(game.id) ? 'favorited' : ''}" 
                                    onclick="cardsView.toggleFavorite(${game.id})">
                                ♥
                            </button>
                            <button class="btn-add-cart ${!game.inStock ? 'disabled' : ''}" 
                                    onclick="cardsView.addToCart(${game.id})"
                                    ${!game.inStock ? 'disabled' : ''}>
                                🛒
                            </button>
                        </div>
                    </div>
                </div>
            `;
            gamesGrid.appendChild(gameCard);
        });
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');

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
            search: document.getElementById('searchInput')?.value || ''
        };

        this.filteredGames = gamesAPI.getFilteredGames(filters);
        this.renderGames();
    }

    addToCart(gameId) {
        const success = gamesAPI.addToCart(gameId);
        if (success) {
            this.showNotification('🎮 Juego añadido al carrito', 'success');
        }
    }

    toggleFavorite(gameId) {
        const isNowFavorite = gamesAPI.toggleFavorite(gameId);
        this.showNotification(
            isNowFavorite ? '❤️ Añadido a favoritos' : '💔 Eliminado de favoritos', 
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
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#ff9800'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    viewCart() {
        const cart = gamesAPI.getCart();
        if (cart.length === 0) {
            this.showNotification('🛒 El carrito está vacío', 'info');
        } else {
            const total = gamesAPI.getCartTotal();
            const cartItems = cart.map(item => 
                `• ${item.title} x${item.quantity} - $${(item.finalPrice * item.quantity).toFixed(2)}`
            ).join('\n');
            
            alert(`🛒 Carrito:\n${cartItems}\n\n💰 Total: $${total.toFixed(2)}`);
        }
    }
}


const cardsView = new CardsView();


function viewCart() {
    cardsView.viewCart();
}

function toggleFavorite(gameId) {
    cardsView.toggleFavorite(gameId);
}

function addToCart(gameId) {
    cardsView.addToCart(gameId);
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

console.log('🎮 CardsView visual cargado');