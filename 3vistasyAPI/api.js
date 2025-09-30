
class GamesAPI {
    constructor() {
        this.games = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.filters = {
            category: 'all',
            platform: 'all',
            priceRange: 'all',
            inStock: false,
            search: ''
        };
        this.init();
    }

    
    async init() {
        try {
            console.log('🔄 Cargando juegos...');
            const response = await fetch('./data/games.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Juegos cargados:', data.games);
            this.games = data.games;
            this.dispatchEvent('dataLoaded', this.games);
        } catch (error) {
            console.error('❌ Error loading games:', error);
            console.log('🔄 Usando juegos por defecto...');
            this.games = this.getDefaultGames();
            this.dispatchEvent('dataLoaded', this.games);
        }
    }

    
    getDefaultGames() {
        return [
            {
                id: 1,
                title: "Need For Speed Hot Pursuit",
                description: "Un emocionante juego de carreras y persecuciones a alta velocidad. Enfréntate a la policía o únete a ellos en intensas persecuciones.",
                price: 49.99,
                category: "carreras",
                platform: ["PC", "PS4", "XBOX"],
                rating: 4.5,
                releaseYear: 2020,
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                icon: "🏎️",
                inStock: true,
                discount: 0
            },
            {
                id: 2,
                title: "Need For Speed Payback",
                description: "Enfréntate a la casa en esta aventura de acción llena de giros inesperados. Personaliza tus vehículos y desata la venganza.",
                price: 39.99,
                category: "carreras",
                platform: ["PC", "PS4", "XBOX", "Switch"],
                rating: 4.2,
                releaseYear: 2017,
                image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a",
                icon: "🔥",
                inStock: true,
                discount: 10
            },
            {
                id: 3,
                title: "Need For Speed Most Wanted",
                description: "Conviértete en el conductor más buscado de la ciudad. Escapa de la policía y domina las calles en este juego de mundo abierto.",
                price: 29.99,
                category: "carreras",
                platform: ["PC", "PS3", "XBOX 360"],
                rating: 4.7,
                releaseYear: 2012,
                image: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca",
                icon: "👑",
                inStock: true,
                discount: 20
            },
            {
                id: 4,
                title: "Forza Horizon 4",
                description: "Explora la hermosa Gran Bretaña en este festival de carreras de mundo abierto. Disfruta de las estaciones cambiantes y cientos de autos.",
                price: 59.99,
                category: "carreras",
                platform: ["PC", "XBOX"],
                rating: 4.8,
                releaseYear: 2018,
                image: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc",
                icon: "⚡",
                inStock: false,
                discount: 15
            },
            {
                id: 5,
                title: "Midnight Club Los Angeles",
                description: "Carreras callejeras en la ciudad de Los Ángeles. Personaliza tus autos y compite en las calles de LA en este título clásico.",
                price: 19.99,
                category: "carreras",
                platform: ["PS3", "XBOX 360"],
                rating: 4.3,
                releaseYear: 2008,
                image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                icon: "🌃",
                inStock: true,
                discount: 30
            }
        ];
    }

    
    getAllGames() {
        return this.games;
    }

    
    getGameById(id) {
        return this.games.find(game => game.id === parseInt(id));
    }

    
    getFilteredGames(filters = this.filters) {
        this.filters = { ...this.filters, ...filters };
        
        return this.games.filter(game => {
            if (filters.category !== 'all' && game.category !== filters.category) return false;
            if (filters.platform !== 'all' && !game.platform.includes(filters.platform)) return false;
            if (filters.inStock && !game.inStock) return false;
            if (filters.search && !game.title.toLowerCase().includes(filters.search.toLowerCase())) return false;

            
            if (filters.priceRange !== 'all') {
                const price = this.getFinalPrice(game);
                switch (filters.priceRange) {
                    case 'under25': if (price > 25) return false; break;
                    case '25to50': if (price < 25 || price > 50) return false; break;
                    case 'over50': if (price < 50) return false; break;
                }
            }

            return true;
        });
    }

    
    getFinalPrice(game) {
        return game.price * (1 - game.discount / 100);
    }

    
    addToCart(gameId) {
        const game = this.getGameById(gameId);
        if (!game) return false;

        const existingItem = this.cart.find(item => item.id === gameId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...game,
                quantity: 1,
                finalPrice: this.getFinalPrice(game)
            });
        }

        this.saveCart();
        this.dispatchEvent('cartUpdated', this.cart);
        return true;
    }

    removeFromCart(gameId) {
        this.cart = this.cart.filter(item => item.id !== gameId);
        this.saveCart();
        this.dispatchEvent('cartUpdated', this.cart);
    }

    updateCartQuantity(gameId, quantity) {
        const item = this.cart.find(item => item.id === gameId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeFromCart(gameId);
            } else {
                this.saveCart();
                this.dispatchEvent('cartUpdated', this.cart);
            }
        }
    }

    getCart() {
        return this.cart;
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.dispatchEvent('cartUpdated', this.cart);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    
    toggleFavorite(gameId) {
        const index = this.favorites.indexOf(gameId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(gameId);
        }
        this.saveFavorites();
        this.dispatchEvent('favoritesUpdated', this.favorites);
        return !(index > -1);
    }

    isFavorite(gameId) {
        return this.favorites.includes(gameId);
    }

    getFavorites() {
        return this.games.filter(game => this.favorites.includes(game.id));
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    
    sortGames(games, sortBy) {
        const sortedGames = [...games];
        
        switch (sortBy) {
            case 'price-asc': return sortedGames.sort((a, b) => this.getFinalPrice(a) - this.getFinalPrice(b));
            case 'price-desc': return sortedGames.sort((a, b) => this.getFinalPrice(b) - this.getFinalPrice(a));
            case 'name-asc': return sortedGames.sort((a, b) => a.title.localeCompare(b.title));
            case 'name-desc': return sortedGames.sort((a, b) => b.title.localeCompare(a.title));
            case 'rating': return sortedGames.sort((a, b) => b.rating - a.rating);
            case 'newest': return sortedGames.sort((a, b) => b.releaseYear - a.releaseYear);
            default: return sortedGames;
        }
    }

    
    on(event, callback) {
        document.addEventListener(`gamesapi:${event}`, (e) => callback(e.detail));
    }

    dispatchEvent(event, data) {
        document.dispatchEvent(new CustomEvent(`gamesapi:${event}`, { detail: data }));
    }

    
    getCategories() {
        return [...new Set(this.games.map(game => game.category))];
    }

    getPlatforms() {
        const allPlatforms = this.games.flatMap(game => game.platform);
        return [...new Set(allPlatforms)];
    }
}


const gamesAPI = new GamesAPI();