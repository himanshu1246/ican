/**
 * ENGINE-3D.JS
 * Custom Vanilla JS 3D Canvas Renderer
 * 
 * Renders a 3D network of nodes (vertices and edges) that rotate 
 * based on scroll position and mouse/touch interaction.
 * Optimized for 60fps on mobile and desktop.
 */

document.addEventListener('DOMContentLoaded', () => {
    init3DEngine();
    initScrollAnimations();
    initMobileMenu();
});

function init3DEngine() {
    const canvas = document.getElementById('canvas-3d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize performance
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Configuration
    const NODE_COUNT = window.innerWidth > 768 ? 150 : 70; // Less nodes on mobile
    const CONNECTION_DISTANCE = 250;
    const ROTATION_SPEED = 0.001;
    
    // 3D Variables
    let nodes = [];
    let angleX = 0;
    let angleY = 0;
    let targetAngleX = 0;
    let targetAngleY = 0;

    // Generate Nodes in a 3D Sphere
    for (let i = 0; i < NODE_COUNT; i++) {
        // Golden ratio spiral for even distribution
        const phi = Math.acos(-1 + (2 * i) / NODE_COUNT);
        const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
        
        const radius = Math.random() * 400 + 200; // Radius between 200 and 600
        
        nodes.push({
            x: radius * Math.cos(theta) * Math.sin(phi),
            y: radius * Math.sin(theta) * Math.sin(phi),
            z: radius * Math.cos(phi),
            baseX: radius * Math.cos(theta) * Math.sin(phi),
            baseY: radius * Math.sin(theta) * Math.sin(phi),
            baseZ: radius * Math.cos(phi)
        });
    }

    // Interactive Tracking
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - width / 2) * 0.0005;
        mouseY = (e.clientY - height / 2) * 0.0005;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        mouseX = (e.touches[0].clientX - width / 2) * 0.001;
        mouseY = (e.touches[0].clientY - height / 2) * 0.001;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }, { passive: true });

    // 3D Projection Math
    function project(node) {
        // Apply Rotations (Scroll controls X, Mouse controls Y/Z)
        targetAngleX = (scrollY * 0.001) + mouseY;
        targetAngleY = ROTATION_SPEED * performance.now() + mouseX;

        // Smooth interpolation
        angleX += (targetAngleX - angleX) * 0.05;
        angleY += (targetAngleY - angleY) * 0.05;

        // Rotation around Y axis
        let x1 = node.baseX * Math.cos(angleY) - node.baseZ * Math.sin(angleY);
        let z1 = node.baseZ * Math.cos(angleY) + node.baseX * Math.sin(angleY);

        // Rotation around X axis
        let y2 = node.baseY * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = z1 * Math.cos(angleX) + node.baseY * Math.sin(angleX);

        // 3D to 2D Projection (Perspective)
        const fov = 800;
        const scale = fov / (fov + z2);
        
        return {
            x: (x1 * scale) + (width / 2),
            y: (y2 * scale) + (height / 2),
            scale: scale,
            z: z2 // Keep Z for depth sorting/opacity
        };
    }

    // Render Loop
    function render() {
        // Clear background with dark cinematic color
        ctx.fillStyle = '#050508'; 
        ctx.fillRect(0, 0, width, height);

        const projectedNodes = nodes.map(project);
        
        // Sort by Z index so closer lines draw on top (Painter's Algorithm)
        projectedNodes.sort((a, b) => b.z - a.z);

        // Draw Connections
        ctx.lineWidth = 1;
        for (let i = 0; i < projectedNodes.length; i++) {
            const n1 = projectedNodes[i];
            // Fade out distant nodes
            if (n1.z > 400) continue; 
            
            for (let j = i + 1; j < projectedNodes.length; j++) {
                const n2 = projectedNodes[j];
                
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE * n1.scale) {
                    // Opacity based on distance and depth
                    const opacity = (1 - (dist / (CONNECTION_DISTANCE * n1.scale))) * (1 - (n1.z + 400) / 800);
                    if (opacity > 0) {
                        // Saffron and Green gradient connecting lines
                        ctx.strokeStyle = `rgba(255, 153, 51, ${opacity * 0.4})`;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Draw Nodes
        for (const node of projectedNodes) {
            if (node.z > 400) continue;
            
            const radius = Math.max(0.5, 3 * node.scale);
            const opacity = 1 - (node.z + 400) / 800;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(render);
    }

    render();
}

/**
 * Scroll Animations via Intersection Observer
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Mobile Menu Logic
 */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav-links');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            toggle.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        });
    }
}
