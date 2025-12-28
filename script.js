

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
        // Fade in the page
        setTimeout(() => {
            transitionOverlay.classList.add('fade-out');
        }, 100);

        // Intercept links
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Skip if: no href, hash link, external link, or target=_blank
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

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Intersection Observer for Fade-in Animations ---
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

    const animatedElements = document.querySelectorAll('.section-title, .section-subtitle, .about-text, .about-image, .workflow-text, .workflow-image, .gallery-item, .glass-card, .vision-section, .hero-title, .brand-identity-section, [class*="reveal-"]');
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

    // --- Logo Comparison Slider ---
    function initComparisons() {
        const container = document.querySelector('.img-comp-container');
        const overlay = document.querySelector('.img-comp-overlay');
        const handle = document.querySelector('.comp-slider-handle');
        if (!container || !overlay || !handle) return;

        let clicked = 0;
        let w = container.offsetWidth;
        slide(w / 2);

        handle.addEventListener("mousedown", slideReady);
        handle.addEventListener("touchstart", slideReady);
        container.addEventListener("mousedown", slideReady);
        container.addEventListener("touchstart", slideReady);
        window.addEventListener("mouseup", slideFinish);
        window.addEventListener("touchend", slideFinish);

        function slideReady(e) {
            e.preventDefault();
            clicked = 1;
            container.classList.add('dragging');
            window.addEventListener("mousemove", slideMove);
            window.addEventListener("touchmove", slideMove);
            slideMove(e);
        }

        function slideFinish() {
            clicked = 0;
            container.classList.remove('dragging');
            window.removeEventListener("mousemove", slideMove);
            window.removeEventListener("touchmove", slideMove);
        }

        function slideMove(e) {
            if (clicked == 0) return;
            let pos = getCursorPos(e);
            if (pos < 0) pos = 0;
            if (pos > w) pos = w;
            slide(pos);
        }

        function getCursorPos(e) {
            e = (e.changedTouches) ? e.changedTouches[0] : e;
            const a = container.getBoundingClientRect();
            return e.clientX - a.left;
        }

        function slide(x) {
            overlay.style.width = x + "px";
            handle.style.left = overlay.offsetWidth + "px";
        }
    }
    initComparisons();

    // --- Color Palette Copy ---
    const colorSwatches = document.querySelectorAll('.color-swatch-item');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const colorCode = swatch.getAttribute('data-color');
            const codeElement = swatch.querySelector('.color-code');
            const originalText = codeElement.innerText;

            const showSuccess = () => {
                codeElement.innerText = "Copied!";
                codeElement.style.color = "#4ade80";
                setTimeout(() => {
                    codeElement.innerText = originalText;
                    codeElement.style.color = "";
                }, 1500);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(colorCode).then(showSuccess);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = colorCode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showSuccess();
            }
        });
    });

    // --- Neon Pipeline Progress & Node Activation ---
    const workflowSection = document.querySelector('.workflow-section');
    const pipelineFill = document.querySelector('.pipeline-fill');
    const workflowNodes = document.querySelectorAll('.workflow-node-item');

    function updateTimeline() {
        if (!workflowSection || !pipelineFill) return;

        const windowHeight = window.innerHeight;
        const system = document.querySelector('.workflow-system');
        if (!system) return;

        const systemRect = system.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;

        // 1. Pipeline Progress
        // Mobile needs slightly different trigger points to feel right
        const drawPoint = windowHeight * (isMobile ? 0.5 : 0.6);
        let progress = (drawPoint - systemRect.top) / systemRect.height;
        progress = Math.max(0, Math.min(1, progress));
        pipelineFill.style.height = `${progress * 100}%`;

        // 2. Atmosphere Shift
        if (progress > 0.05 && progress < 0.95) {
            document.body.classList.add('workflow-active');
        } else {
            document.body.classList.remove('workflow-active');
        }

        // 3. Precise Node Activation
        // On mobile, trigger closer to the center of the screen
        const activationZone = windowHeight * (isMobile ? 0.55 : 0.65);
        workflowNodes.forEach(node => {
            const nodePoint = node.querySelector('.node-point');
            if (!nodePoint) return;
            const pointRect = nodePoint.getBoundingClientRect();
            const pointCenter = pointRect.top + (pointRect.height / 2);

            if (pointCenter < activationZone) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateTimeline);
    });
    updateTimeline();

    // --- 3D Magnet Interaction ---
    const workflowCards = document.querySelectorAll('.workflow-card');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        workflowCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // --- Mouse Parallax ---
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const globalBg = document.querySelector('.global-background');

    document.addEventListener('mousemove', (e) => {
        const xPos = (e.clientX / window.innerWidth - 0.5) * 2;
        const yPos = (e.clientY / window.innerHeight - 0.5) * 2;
        if (heroTitle) heroTitle.style.transform = `translate(${xPos * -20}px, ${yPos * -20}px)`;
        if (heroSubtitle) heroSubtitle.style.transform = `translate(${xPos * -10}px, ${yPos * -10}px)`;
        if (globalBg) globalBg.style.transform = `translate(${xPos * 10}px, ${yPos * 10}px) scale(1.1)`;
    });

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const aboutImage = document.querySelector('.about-image img');
        if (aboutImage) {
            aboutImage.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    const contactSuccessMsg = document.getElementById('contact-success');

    // [중요] join-script.js와 동일한 구글 앱스 스크립트 URL을 입력하세요.
    const CONTACT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzBHxUU4Nx9JcTEagrClAwc8qHVMA0Lmwa6X3Abfr-OEqu4f4gogNkpLntc6nDWvJGI/exec';

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const originalBtnContent = contactSubmitBtn.innerHTML;
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.innerHTML = '<span>Sending...</span> <div class="loading-spinner"></div>';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            data.type = 'contact';

            console.log("=== 파일 업로드 기능 제거됨 ===");
            console.log("1. 폼 데이터:", data);

            // File Upload Logic Removed as per user request
            console.log("2. 파일 첨부 기능이 비활성화되었습니다.");

            console.log("10. 최종 전송 데이터:", data);
            console.log("11. 데이터 크기 (JSON):", JSON.stringify(data).length, "bytes");

            try {
                if (!CONTACT_SCRIPT_URL) {
                    throw new Error("Target URL is not defined.");
                }

                console.log("12. 서버로 전송 시작...");
                console.log("13. URL:", CONTACT_SCRIPT_URL);

                const response = await fetch(CONTACT_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // [중요] CORS 에러 우회를 위해 no-cors 사용
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                });

                console.log("14. 서버로 데이터 전송 완료 (no-cors 모드)");

                // no-cors 모드에서는 응답 내용을 확인할 수 없으므로(opaque response),
                // 네트워크 오류가 발생하지 않는 한 성공으로 간주하고 처리합니다.

                // Reset button state
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.innerHTML = originalBtnContent;

                console.log("15. 성공 메시지 표시");
                contactForm.classList.add('hidden');
                contactSuccessMsg.classList.remove('hidden');
            } catch (error) {
                console.error("16. 전송 실패:", error);
                alert("전송에 실패했습니다. 연결 상태를 확인하거나 잠시 후 다시 시도해 주세요.\\n(오류 내용: " + error.message + ")");

                // 버튼 복구
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    // --- Gallery Exhibition Logic ---
    // [New] Dynamic Rendering from gallery-data.js
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
    const filterItems = document.querySelectorAll('.filter-item');
    const galleryCards = document.querySelectorAll('.gallery-item');

    // 1. Filtering System
    if (filterItems.length > 0) {
        filterItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active state
                filterItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                const filterValue = item.getAttribute('data-filter');

                galleryCards.forEach(card => {
                    const cardCreator = card.getAttribute('data-creator');

                    // Simple animation for filtering
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';

                    setTimeout(() => {
                        if (filterValue === 'all' || filterValue === cardCreator) {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'scale(1)';
                            }, 50);
                        } else {
                            card.style.display = 'none';
                        }
                    }, 300);
                });
            });
        });
    }

    // 2. Modal System
    const modal = document.getElementById('project-modal');
    if (modal) {
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalCreator = document.getElementById('modal-creator');
        const modalYear = document.getElementById('modal-year');
        const modalClose = document.querySelector('.modal-close');

        // Open Modal
        let galleryViewer = null;

        // Use event delegation or re-select after rendering
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-item');
            if (card) {
                const cardId = card.getAttribute('data-id');

                const dataItem = typeof galleryData !== 'undefined' ? galleryData.find(item => item.id == cardId) : null;
                if (dataItem) {
                    // Use data from gallery-data.js
                    modalImg.src = dataItem.image;
                    modalTitle.textContent = dataItem.title;
                    modalCreator.textContent = dataItem.creatorName;
                    modalYear.textContent = dataItem.year;
                    const descElement = document.getElementById('modal-desc');
                    if (descElement) descElement.textContent = dataItem.description || "작품 설명이 없습니다.";

                } else {
                    // Fallback to DOM parsing
                    const img = card.querySelector('img');
                    const title = card.querySelector('h3');
                    const creator = card.querySelector('.creator-badge');
                    const year = card.getAttribute('data-year');

                    modalImg.src = img.src;
                    modalTitle.textContent = title.textContent;
                    modalCreator.textContent = creator.textContent;
                    modalYear.textContent = year;
                }

                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.add('active');
                }, 10);
            }
        });


        // Close Modal Function
        const closeModal = () => {
            modal.classList.add('hidden');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        modalClose.addEventListener('click', closeModal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    // --- Portfolio Page Logic (Formal CV) ---
    const portfolioContent = document.getElementById('portfolio-content');
    if (portfolioContent) {


        // 2. URL Parameter Parsing
        const urlParams = new URLSearchParams(window.location.search);
        const memberId = urlParams.get('member');

        // 3. Render Content
        if (memberId && memberData[memberId]) {
            const data = memberData[memberId];
            const template = document.getElementById('portfolio-template');

            // Clear loading/empty state
            portfolioContent.innerHTML = '';

            // Clone template
            const clone = document.importNode(template.content, true);

            // --- Fill Header ---
            clone.getElementById('cv-name').innerText = data.name;
            clone.getElementById('cv-role').innerText = data.role;
            clone.getElementById('cv-contact').innerText = data.email;

            // Photo Logic (Color or Image)
            const photoDiv = clone.getElementById('cv-photo');
            if (data.photoColor.includes('.') || data.photoColor.includes('http')) {
                // If value looks like a file path or URL
                photoDiv.style.backgroundImage = `url('${data.photoColor}')`;
                photoDiv.style.backgroundColor = 'transparent';
            } else {
                // Determine if it is a color HEX/RGB
                photoDiv.style.backgroundColor = data.photoColor;
            }

            // Links
            const linkContainer = clone.getElementById('cv-links');
            data.links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.className = 'cv-link-badge';
                a.innerText = link.name;
                linkContainer.appendChild(a);
            });

            // --- Fill Sections ---

            // Summary
            clone.getElementById('cv-summary').innerText = data.summary;

            // Education
            const eduContainer = clone.getElementById('cv-education');
            data.education.forEach(edu => {
                const li = document.createElement('li');
                li.className = 'cv-list-item';
                li.innerHTML = `
                    <div class="cv-item-left">
                        <div class="cv-item-title">${edu.title}</div>
                        <div class="cv-item-subtitle">${edu.subtitle}</div>
                    </div>
                    <div class="cv-item-right">${edu.date}</div>
                `;
                eduContainer.appendChild(li);
            });

            // Awards
            const awardContainer = clone.getElementById('cv-awards');
            data.awards.forEach(award => {
                const li = document.createElement('li');
                li.className = 'cv-list-item';
                li.innerHTML = `
                    <div class="cv-item-left">
                        <div class="cv-item-title">${award.title}</div>
                        <div class="cv-item-subtitle">${award.subtitle}</div>
                    </div>
                    <div class="cv-item-right">${award.date}</div>
                `;
                awardContainer.appendChild(li);
            });

            // Skills
            const skillContainer = clone.getElementById('cv-skills');
            data.skills.forEach(skill => {
                const div = document.createElement('div');
                div.className = 'cv-skill-item';
                div.innerHTML = `
                    <span class="cv-skill-name">${skill.name}</span>
                    <div class="cv-skill-bar-container">
                        <div class="cv-skill-bar" style="width: ${skill.level}%"></div>
                    </div>
                `;
                skillContainer.appendChild(div);
            });

            // Projects (Case Studies)
            const projectContainer = clone.getElementById('cv-projects');
            data.projects.forEach(proj => {
                const div = document.createElement('div');
                div.className = 'cv-project-item';

                // Create tags HTML
                const tagsHtml = proj.tags.map(tag => `<span class="cv-tag">${tag}</span>`).join('');

                div.innerHTML = `
                    <div class="cv-project-header">
                        <span class="cv-project-title">${proj.title}</span>
                        <span class="cv-project-role">${proj.role}</span>
                    </div>
                    <p class="cv-project-desc">${proj.desc}</p>
                    <div class="cv-project-tags">
                        ${tagsHtml}
                    </div>
                `;
                projectContainer.appendChild(div);
            });

            // Append to DOM
            portfolioContent.appendChild(clone);

        } else {
            // No valid ID -> Show default empty state (selector)
        }
    }
});
