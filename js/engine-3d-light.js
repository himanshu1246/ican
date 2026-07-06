/**
 * ENGINE-3D-LIGHT.JS
 * Custom Vanilla JS 3D Canvas Renderer for Light Theme
 */

document.addEventListener('DOMContentLoaded', () => {
    init3DEngine();
    initScrollAnimations();
    initMobileMenu();
});

function init3DEngine() {
    const canvas = document.getElementById('canvas-3d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false }); 
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const NODE_COUNT = window.innerWidth > 768 ? 120 : 60; 
    const CONNECTION_DISTANCE = 250;
    
    let nodes = [];
    let angleX = 0;
    let angleY = 0;
    let targetAngleX = 0;
    let targetAngleY = 0;

    for (let i = 0; i < NODE_COUNT; i++) {
        const phi = Math.acos(-1 + (2 * i) / NODE_COUNT);
        const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
        const radius = Math.random() * 400 + 200; 
        
        nodes.push({
            x: radius * Math.cos(theta) * Math.sin(phi),
            y: radius * Math.sin(theta) * Math.sin(phi),
            z: radius * Math.cos(phi),
            baseX: radius * Math.cos(theta) * Math.sin(phi),
            baseY: radius * Math.sin(theta) * Math.sin(phi),
            baseZ: radius * Math.cos(phi)
        });
    }

    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - width / 2) * 0.0005;
        mouseY = (e.clientY - height / 2) * 0.0005;
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

    function project(node) {
        targetAngleX = (scrollY * 0.001) + mouseY;
        targetAngleY = (performance.now() * 0.0005) + mouseX;

        angleX += (targetAngleX - angleX) * 0.05;
        angleY += (targetAngleY - angleY) * 0.05;

        let x1 = node.baseX * Math.cos(angleY) - node.baseZ * Math.sin(angleY);
        let z1 = node.baseZ * Math.cos(angleY) + node.baseX * Math.sin(angleY);
        let y2 = node.baseY * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = z1 * Math.cos(angleX) + node.baseY * Math.sin(angleX);

        const fov = 800;
        const scale = fov / (fov + z2);
        
        return {
            x: (x1 * scale) + (width / 2),
            y: (y2 * scale) + (height / 2),
            scale: scale,
            z: z2 
        };
    }

    function render() {
        // Light theme background
        ctx.fillStyle = '#f8f9fc'; 
        ctx.fillRect(0, 0, width, height);

        const projectedNodes = nodes.map(project);
        projectedNodes.sort((a, b) => b.z - a.z);

        ctx.lineWidth = 1;
        for (let i = 0; i < projectedNodes.length; i++) {
            const n1 = projectedNodes[i];
            if (n1.z > 400) continue; 
            
            for (let j = i + 1; j < projectedNodes.length; j++) {
                const n2 = projectedNodes[j];
                const dist = Math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2);

                if (dist < CONNECTION_DISTANCE * n1.scale) {
                    const opacity = (1 - (dist / (CONNECTION_DISTANCE * n1.scale))) * (1 - (n1.z + 400) / 800);
                    if (opacity > 0) {
                        // Saffron lines in light theme
                        ctx.strokeStyle = `rgba(255, 153, 51, ${opacity * 0.5})`;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    }
                }
            }
        }

        for (const node of projectedNodes) {
            if (node.z > 400) continue;
            const radius = Math.max(0.5, 3 * node.scale);
            const opacity = 1 - (node.z + 400) / 800;
            
            // Dark green/slate nodes for contrast in light theme
            ctx.fillStyle = `rgba(19, 136, 8, ${opacity})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(render);
    }
    render();
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

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
