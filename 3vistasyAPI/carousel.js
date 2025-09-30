
const games = [
    { 
        title: "Need For Speed Hot Pursuit", 
        description: "Un emocionante juego de carreras y persecuciones a alta velocidad. Enfréntate a la policía o únete a ellos en intensas persecuciones.",
        icon: "🏎️"
    },
    { 
        title: "Need For Speed Payback", 
        description: "Enfréntate a la casa en esta aventura de acción llena de giros inesperados. Personaliza tus vehículos y desata la venganza.",
        icon: "🔥"
    },
    { 
        title: "Need For Speed Most Wanted", 
        description: "Conviértete en el conductor más buscado de la ciudad. Escapa de la policía y domina las calles en este juego de mundo abierto.",
        icon: "👑"
    },
    { 
        title: "Forza Horizon 4", 
        description: "Explora la hermosa Gran Bretaña en este festival de carreras de mundo abierto. Disfruta de las estaciones cambiantes y cientos de autos.",
        icon: "⚡"
    },
    { 
        title: "Midnight Club Los Angeles", 
        description: "Carreras callejeras en la ciudad de Los Ángeles. Personaliza tus autos y compite en las calles de LA en este título clásico.",
        icon: "🌃"
    }
];

let currentSlide = 0;


function renderCarousel() {
    const carousel = document.getElementById('carousel');
    const carouselControls = document.getElementById('carouselControls');
    
    carousel.innerHTML = '';
    carouselControls.innerHTML = '';
    
    games.forEach((game, index) => {
       
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <h3>${game.title}</h3>
            <p>${game.description}</p>
        `;
        carousel.appendChild(carouselItem);
        
        
        const controlBtn = document.createElement('button');
        controlBtn.className = `carousel-btn ${index === 0 ? 'active' : ''}`;
        controlBtn.addEventListener('click', () => goToSlide(index));
        carouselControls.appendChild(controlBtn);
    });
    
    updateCarousel();
}

function updateCarousel() {
    const carousel = document.getElementById('carousel');
    const controlBtns = document.querySelectorAll('.carousel-btn');
    
    carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    controlBtns.forEach((btn, index) => {
        btn.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % games.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + games.length) % games.length;
    updateCarousel();
}


document.addEventListener('DOMContentLoaded', () => {
    renderCarousel();
    
   
    document.getElementById('nextBtn').addEventListener('click', nextSlide);
    document.getElementById('prevBtn').addEventListener('click', prevSlide);
    
    
    setInterval(nextSlide, 6000);
    
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });
});