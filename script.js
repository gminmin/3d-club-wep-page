
let currentLang = 'ko';

function updateLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    const dropbtns = document.querySelectorAll('.lang-dropbtn');
    dropbtns.forEach(btn => {
        btn.innerHTML = lang === 'ko' ? '한국어 ▾' : 'English ▾';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Page Transitions ---
    const transitionOverlay = document.querySelector('.page-transition-overlay');
    if (transitionOverlay) {
        setTimeout(() => {
            transitionOverlay.classList.add('fade-out');
        }, 100);

        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('http') || link.getAttribute('target') === '_blank') {
                    return;
                }
                e.preventDefault();
                transitionOverlay.classList.remove('fade-out');
                transitionOverlay.classList.add('active');
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            });
        });
    }

    // --- Video Background Loading ---
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
        bgVideo.addEventListener('playing', () => {
            bgVideo.classList.add('loaded');
        });
        if (!bgVideo.paused) {
            bgVideo.classList.add('loaded');
        }
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
            document.body.classList.toggle('mobile-menu-open');
        });
        const navLinks = navLinksContainer.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinksContainer.classList.remove('active');
                document.body.classList.remove('mobile-menu-open');
            });
        });
    }

    // --- Intersection Observer ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.section-title, .section-subtitle, .about-text, .about-image, .workflow-text, .workflow-image, .gallery-item, .glass-card, .vision-section, .hero-title, [class*="reveal-"]');
    animatedElements.forEach(el => {
        if (!el.classList.contains('fade-in') && !Array.from(el.classList).some(c => c.startsWith('reveal-'))) {
            el.classList.add('fade-in');
        }
        observer.observe(el);
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Language Selection ---
    const langLinks = document.querySelectorAll('[data-lang]');
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            updateLanguage(lang);
        });
    });
    updateLanguage('ko');

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    const contactSuccessMsg = document.getElementById('contact-success');

    const CONTACT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxM9lh5FrMSGB1nowP7Q95_9lPddKPVS3Wjpi0JCUecdE9tQcDnvMJsPkwkpzPkLYie8Q/exec';

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const privacyAgreement = document.getElementById('privacy-agreement');
            if (privacyAgreement && !privacyAgreement.checked) {
                const errorMsg = translations[currentLang]?.["contact.privacy_error"] || "개인정보 수집 및 이용에 동의해야 문의 전송이 가능합니다.";
                alert(errorMsg);
                return;
            }

            const originalBtnContent = contactSubmitBtn.innerHTML;
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.innerHTML = '<span>Sending...</span> <div class="loading-spinner"></div>';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            data.type = 'contact';

            try {
                await fetch(CONTACT_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                });
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.innerHTML = originalBtnContent;
                contactForm.classList.add('hidden');
                contactSuccessMsg.classList.remove('hidden');
            } catch (error) {
                console.error("전송 실패:", error);
                alert("전송에 실패했습니다. 연결 상태를 확인하거나 잠시 후 다시 시도해 주세요.");
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    // --- Gallery Logic ---
    const galleryContainer = document.getElementById('gallery-container');
    const indexGalleryGrid = document.querySelector('.gallery-grid');

    function renderGalleryItems(container, items) {
        if (!container) return;
        container.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-item';
            card.setAttribute('data-id', item.id);
            card.setAttribute('data-creator', item.creator);
            card.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="overlay">
                    <span class="creator-badge">${item.creatorName}</span>
                    <h3>${item.title}</h3>
                </div>
            `;
            container.appendChild(card);
        });
    }

    if (typeof galleryData !== 'undefined') {
        if (galleryContainer) {
            renderGalleryItems(galleryContainer, galleryData);
        } else if (indexGalleryGrid) {
            renderGalleryItems(indexGalleryGrid, galleryData.slice(0, 3));
        }
    }

    const modal = document.getElementById('project-modal');
    if (modal) {
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalCreator = document.getElementById('modal-creator');
        const modalYear = document.getElementById('modal-year');
        const modalClose = document.querySelector('.modal-close');

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-item');
            if (card) {
                const cardId = card.getAttribute('data-id');
                const dataItem = typeof galleryData !== 'undefined' ? galleryData.find(item => item.id == cardId) : null;
                if (dataItem) {
                    modalImg.src = dataItem.image;
                    modalTitle.textContent = dataItem.title;
                    modalCreator.textContent = dataItem.creatorName;
                    modalYear.textContent = dataItem.year;
                    const descElement = document.getElementById('modal-desc');
                    if (descElement) descElement.textContent = dataItem.description || "작품 설명이 없습니다.";
                }
                modal.classList.remove('hidden');
                setTimeout(() => modal.classList.add('active'), 10);
            }
        });

        const closeModal = () => {
            modal.classList.add('hidden');
            modal.classList.remove('active');
        };
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }
});
