// StudyLight JavaScript for Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initNavigation();
    initSmoothScrolling();
    initContentNavigation();
    initCollapsibleSections();
    initSubjectNavigation();
    initMobileMenu();
    initScrollEffects();
});

// Navigation Functions
function initNavigation() {
    // Update active nav links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-item');
    
    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Content Navigation (for content pages)
function initContentNavigation() {
    const contentNav = document.querySelector('.content-nav');
    if (contentNav) {
        // Make navigation sticky with smooth transitions
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                contentNav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            } else {
                contentNav.style.boxShadow = 'none';
            }
        });

        // Auto-scroll navigation items into view
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                // Scroll the nav item into view if needed
                setTimeout(() => {
                    this.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }, 100);
            });
        });
    }
}

// Collapsible Sections
function initCollapsibleSections() {
    // Add toggle functionality to section headers
    const sectionHeaders = document.querySelectorAll('.section-header-content');
    
    sectionHeaders.forEach(header => {
        // Add click handler only if not already added
        if (!header.classList.contains('toggle-initialized')) {
            header.classList.add('toggle-initialized');
            header.style.cursor = 'pointer';
            
            // Add toggle icon
            const toggleIcon = document.createElement('i');
            toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
            toggleIcon.style.float = 'right';
            toggleIcon.style.transition = 'transform 0.3s ease';
            header.appendChild(toggleIcon);
            
            header.addEventListener('click', function() {
                const section = this.closest('.content-section');
                const body = section.querySelector('.section-body');
                const icon = this.querySelector('.toggle-icon');
                
                if (body.style.display === 'none') {
                    body.style.display = 'block';
                    icon.style.transform = 'rotate(0deg)';
                    section.classList.remove('collapsed');
                } else {
                    body.style.display = 'none';
                    icon.style.transform = 'rotate(-90deg)';
                    section.classList.add('collapsed');
                }
            });
        }
    });
}

// Subject Navigation
function initSubjectNavigation() {
    // Handle subject card clicks
    window.openSubject = function(subject) {
        if (subject === 'chemistry') {
            window.location.href = 'chemistry.html';
        } else {
            // Show coming soon message
            showComingSoonMessage(subject);
        }
    };

    // Handle chapter card clicks
    window.openChapter = function(chapter) {
        if (chapter === 'electrolysis') {
            window.location.href = 'electrolysis.html';
        } else {
            showComingSoonMessage(chapter);
        }
    };
}

// Mobile Menu
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navToggle.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            });
        });
    }
}

// Scroll Effects
function initScrollEffects() {
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.content-section, .subject-card, .chapter-card').forEach(el => {
        observer.observe(el);
    });

    // Add CSS for fade-in animation if not already present
    if (!document.querySelector('#scroll-animations')) {
        const style = document.createElement('style');
        style.id = 'scroll-animations';
        style.textContent = `
            .content-section,
            .subject-card,
            .chapter-card {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .content-section.fade-in,
            .subject-card.fade-in,
            .chapter-card.fade-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .nav-links {
                display: flex;
                gap: 2rem;
                transition: all 0.3s ease;
            }
            
            @media (max-width: 768px) {
                .nav-links {
                    position: fixed;
                    top: 70px;
                    left: -100%;
                    width: 100%;
                    height: calc(100vh - 70px);
                    background: white;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding: 2rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    transition: left 0.3s ease;
                }
                
                .nav-links.active {
                    left: 0;
                }
                
                .nav-toggle span {
                    transition: all 0.3s ease;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Utility Functions
function showComingSoonMessage(item) {
    // Create and show a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        text-align: center;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-clock" style="font-size: 2rem; color: #f59e0b; margin-bottom: 1rem;"></i>
        <h3 style="margin-bottom: 1rem; text-transform: capitalize;">${item} Coming Soon!</h3>
        <p style="margin-bottom: 1.5rem; color: #6b7280;">We're working hard to bring you more content. Stay tuned!</p>
        <button onclick="this.parentElement.remove()" style="background: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">Got it!</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Search functionality (future enhancement)
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            // Implement search functionality here
            console.log('Searching for:', query);
        });
    }
}

// Progress tracking (future enhancement)
function trackProgress() {
    // Track which sections user has visited
    const visitedSections = JSON.parse(localStorage.getItem('visitedSections') || '[]');
    
    // Update progress bars based on visited sections
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        // Update progress based on user activity
    });
}

// Theme switching (future enhancement)
function initThemeSwitch() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
if (window.initNavigation) {
    const debouncedNavUpdate = debounce(initNavigation, 10);
    window.addEventListener('scroll', debouncedNavUpdate);
}

// Print styles optimization
window.addEventListener('beforeprint', function() {
    // Expand all collapsed sections for printing
    document.querySelectorAll('.section-body').forEach(body => {
        body.style.display = 'block';
    });
});

// Error handling
window.addEventListener('error', function(e) {
    console.log('StudyLight Error:', e.error);
    // Could implement error reporting here
});

// Console welcome message
console.log(`
    ╔═══════════════════════════════════════╗
    ║            Welcome to StudyLight!      ║
    ║                                       ║
    ║   🌟 Made for students, by students   ║
    ║   💡 Illuminating knowledge since 2025║
    ║                                       ║
    ╚═══════════════════════════════════════╝
`);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        initSmoothScrolling,
        showComingSoonMessage,
        debounce
    };
}