/**
 * ULTRA PREMIUM 3D - main.js
 * Core UI, Advanced Desktop Mouse Tracking, and Mobile Scroll-Driven 3D
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroParallax();
  init3DCarousel();
  
  // Apply different 3D engines based on device
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    // Desktop: Advanced Mouse Tracking with Glare
    initDesktop3DTilt();
  } else {
    // Mobile/Touch: Scroll-driven 3D transforms
    initMobileScroll3D();
  }
});

/**
 * Mobile Navigation Toggle
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
      menuToggle.innerHTML = isExpanded ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.innerHTML = '☰';
        }
      });
    });
  }
}

/**
 * Hero Section 3D Parallax
 */
function initHeroParallax() {
  const scene = document.querySelector('.scene-layer.layer-bg');
  const heroContent = document.querySelector('.hero-content');
  
  if (!scene || !heroContent) return;

  window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      if (scrolled > window.innerHeight) return;
      
      const zTransform = -500 + (scrolled * 1.2);
      const yTransform = scrolled * 0.5;
      scene.style.transform = `translate3d(0, ${yTransform}px, ${zTransform}px) scale(1.5)`;
      
      const opacity = Math.max(0, 1 - (scrolled / window.innerHeight) * 1.5);
      heroContent.style.opacity = opacity;
      heroContent.style.transform = `translate3d(0, ${scrolled * 0.4}px, ${scrolled * -0.5}px)`;
    });
  }, { passive: true });
}

/**
 * Desktop: Advanced 3D Mouse Tilt with Dynamic Glare
 */
function initDesktop3DTilt() {
  const cards = document.querySelectorAll('.glass-card, .about-img-wrapper, .timeline-content');
  
  cards.forEach(card => {
    // Ensure glare element exists for glass cards
    let glare = card.querySelector('.glare');
    if (card.classList.contains('glass-card') && !glare) {
      glare = document.createElement('div');
      glare.className = 'glare';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (max 20 degrees for dramatic effect)
      const rotateX = ((y - centerY) / centerY) * -20;
      const rotateY = ((x - centerX) / centerX) * 20;
      
      // Apply extreme 3D transform
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      
      // Move the glare based on mouse position
      if (glare) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      if (glare) glare.style.background = `linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)`;
    });
  });
}

/**
 * Mobile: Scroll-Driven 3D Transformations
 * Uses IntersectionObserver and scroll position to twist cards as they enter/leave viewport
 */
function initMobileScroll3D() {
  const cards = document.querySelectorAll('.glass-card, .about-img-wrapper');
  
  // Setup Observer to know which cards are on screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));

  // Link 3D rotation to scroll for elements in view
  window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      cards.forEach(card => {
        if (!card.classList.contains('in-view')) return;
        
        const rect = card.getBoundingClientRect();
        // Calculate how far the card is through the viewport (-1 to 1)
        const elementCenter = rect.top + (rect.height / 2);
        const viewCenter = windowHeight / 2;
        const offset = (elementCenter - viewCenter) / viewCenter; // -1 (top) to 1 (bottom)
        
        // Calculate dramatic mobile 3D rotations based on scroll offset
        const rotateX = offset * 25; // Tilt forward/back up to 25deg
        const rotateY = offset * -10; // Slight twist
        const scale = 1 - Math.abs(offset) * 0.1; // Scale down slightly at edges
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
        card.style.transition = 'transform 0.1s ease-out';
      });
    });
  }, { passive: true });
}

/**
 * 3D Instagram Museum Carousel
 */
function init3DCarousel() {
  const carouselItems = document.querySelectorAll('.carousel-item');
  if (carouselItems.length === 0) return;

  const numItems = carouselItems.length;
  const theta = 360 / numItems;
  const itemWidth = carouselItems[0].offsetWidth;
  // Dynamic radius calculation based on item width and count
  const radius = Math.round((itemWidth / 2) / Math.tan(Math.PI / numItems)) + 60; // 60px buffer for dramatic spread

  carouselItems.forEach((item, index) => {
    const angle = theta * index;
    item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
  });
}
