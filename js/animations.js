const AnimationManager = {
    init() {
        this.initHeroParticles();
        this.initScrollAnimations();
        this.initStatCounters();
        this.initFloatingIcons();
    },

    initHeroParticles() {
        const canvas = document.getElementById('heroParticles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 5 + 1,
                speedX: Math.random() * 3 - 1.5,
                speedY: Math.random() * 3 - 1.5,
                opacity: Math.random() * 0.5 + 0.3
            };
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(76, 175, 80, ${particle.opacity})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        // Initialize
        resizeCanvas();
        for (let i = 0; i < 50; i++) {
            particles.push(createParticle());
        }
        animate();

        window.addEventListener('resize', resizeCanvas);
    },

    initScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    },

    initStatCounters() {
        const stats = document.querySelectorAll('.stat-counter');
        
        const animateValue = (element, start, end, duration) => {
            let startTimestamp = null;
            
            function step(timestamp) {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentValue = Math.floor(progress * (end - start) + start);
                element.textContent = currentValue.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            
            requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.target);
                    animateValue(entry.target, 0, target, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    },

    initFloatingIcons() {
        const icons = [
            { icon: 'fa-dumbbell', color: '#4CAF50' },
            { icon: 'fa-heartbeat', color: '#f44336' },
            { icon: 'fa-running', color: '#2196F3' },
            { icon: 'fa-bicycle', color: '#FF9800' }
        ];

        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        icons.forEach((iconData, index) => {
            const icon = document.createElement('i');
            icon.className = `fas ${iconData.icon} floating-icon`;
            icon.style.color = iconData.color;
            icon.style.animationDelay = `${index * 0.5}s`;
            heroSection.appendChild(icon);
        });
    }
};

window.AnimationManager = AnimationManager;
