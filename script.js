/* ==========================================================================
   Saran Neralla Portfolio JavaScript
   Handles theme toggle, typing animations, mobile nav, skills tabs,
   project filtering, AJAX form submission, and scroll animation fallbacks.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. Dark/Light Theme Switcher
       ========================================== */
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;

    // Check for saved theme preference, otherwise default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });


    /* ==========================================
       2. Mobile Navigation Menu Toggle
       ========================================== */
    const mobileNavToggleBtn = document.getElementById('mobile-nav-toggle-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        const isExpanded = mobileNavToggleBtn.getAttribute('aria-expanded') === 'true';
        mobileNavToggleBtn.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    };

    mobileNavToggleBtn.addEventListener('click', toggleMenu);

    // Close menu when clicking link, update active link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavToggleBtn.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
        });
    });

    // Update active class on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    /* ==========================================
       3. Typewriting Animation (Hero)
       ========================================== */
    const typingTextEl = document.getElementById('typing-text');
    const words = ['Software Architect', 'Edu-Tech Builder', 'Problem Solver'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const typeAnimation = () => {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingTextEl.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deletes faster
        } else {
            typingTextEl.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120; // Normal typing speed
        }

        // Typing finished a word
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingSpeed = 1500; // Pause before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before next word
        }

        setTimeout(typeAnimation, typingSpeed);
    };

    if (typingTextEl) {
        setTimeout(typeAnimation, 1000);
    }


    /* ==========================================
       4. Expandable Tech Stack Cards Toggle
       ========================================== */
    const expandButtons = document.querySelectorAll('.expand-btn');

    expandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.tech-card');
            const expandableWrapper = card.querySelector('.tech-chips-expandable');
            const btnText = btn.querySelector('.btn-text');
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';

            // Toggle active state attributes
            btn.setAttribute('aria-expanded', !isExpanded);
            btn.classList.toggle('active');
            expandableWrapper.classList.toggle('expanded');

            // Update text matching state
            if (isExpanded) {
                btnText.textContent = 'Show More';
            } else {
                btnText.textContent = 'Show Less';
            }
        });
    });


    /* ==========================================
       5. Projects Filtering Logic
       ========================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state of filter buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Animate fade-out first
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        card.classList.remove('filtered-out');
                        // Trigger reflow to restart transition
                        void card.offsetWidth;
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    } else {
                        card.classList.add('filtered-out');
                    }
                }, 300);
            });
        });
    });


    /* ==========================================
       6. Scroll-Driven Fallbacks (Firefox & Older)
       ========================================== */

    // Fallback 1: Shrinking Header
    const shrinkingHeaderSupport = CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)');
    if (!shrinkingHeaderSupport) {
        const header = document.getElementById('main-header');
        
        const handleScrollHeader = () => {
            if (window.scrollY > 60) {
                header.classList.add('header-shrunk');
            } else {
                header.classList.remove('header-shrunk');
            }
        };

        window.addEventListener('scroll', handleScrollHeader);
        handleScrollHeader(); // Initial call
    }

    // Fallback 2: Section Scroll Reveal
    const scrollRevealSupport = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
    if (!scrollRevealSupport) {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        // Hide elements initially
        revealElements.forEach(el => el.classList.add('scroll-reveal-hidden'));

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-reveal-active');
                    // Stop observing once animated in
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    }


    /* ==========================================
       7. Contact Form AJAX Submission (Web3Forms)
       ========================================== */
    const contactForm = document.getElementById('contact-form');
    const toastResponse = document.getElementById('form-response-toast');
    const responseIcon = toastResponse?.querySelector('.response-icon');
    const responseText = toastResponse?.querySelector('.response-text');
    const submitBtn = document.getElementById('btn-contact-submit');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check if default access key is still present
            const accessKeyEl = contactForm.querySelector('input[name="access_key"]');
            if (accessKeyEl && accessKeyEl.value === 'YOUR_ACCESS_KEY_HERE') {
                showToast(
                    'warning', 
                    'Form configured successfully! Please configure your Web3Forms access_key in index.html to receive actual messages.'
                );
                return;
            }

            // Disable submit button & show loading state
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>Sending...</span>
                <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M6.34 17.66l2.83-2.83M17.66 6.34l2.83-2.83"></path>
                </svg>
            `;

            // CSS animation style for loading spinner
            const style = document.createElement('style');
            style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);

            const formData = new FormData(contactForm);
            const jsonObject = Object.fromEntries(formData);
            const jsonBody = JSON.stringify(jsonObject);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: jsonBody
                });

                const result = await response.json();

                if (response.status === 200) {
                    showToast('success', 'Message sent successfully! I will get back to you soon.');
                    contactForm.reset();
                } else {
                    console.error('Web3Forms Error:', result);
                    showToast('error', result.message || 'Something went wrong. Please try again later.');
                }
            } catch (err) {
                console.error('Network Error:', err);
                showToast('error', 'Network error. Please check your internet connection and try again.');
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    const showToast = (type, message) => {
        if (!toastResponse || !responseIcon || !responseText) return;

        // Reset classes
        toastResponse.className = 'form-response';
        toastResponse.classList.add(type);
        
        // Set content and icon
        responseText.textContent = message;
        
        if (type === 'success') {
            responseIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
        } else if (type === 'warning') {
            responseIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `;
        } else {
            responseIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
        }

        // Show Toast
        toastResponse.style.display = 'flex';

        // Auto hide warning/success toasts after 7 seconds, keep error toast for visibility
        if (type !== 'error') {
            setTimeout(() => {
                toastResponse.style.display = 'none';
            }, 7000);
        }
    };
});
