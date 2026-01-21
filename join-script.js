document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recruitment-form');
    const successMessage = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');
    const fieldSelect = document.getElementById('field');
    const otherFieldContainer = document.getElementById('other-field-container');
    const otherFieldInput = document.getElementById('other-field');

    if (!form) return;

    // 지원 분야 '기타' 선택 시 입력창 표시 로직
    fieldSelect.addEventListener('change', () => {
        if (fieldSelect.value === 'other') {
            otherFieldContainer.classList.remove('hidden');
            otherFieldInput.required = true;
            otherFieldInput.focus();
        } else {
            otherFieldContainer.classList.add('hidden');
            otherFieldInput.required = false;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. UI Loading State
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-text">데이터 전송 중...</span> <div class="loading-spinner"></div>';

        // 폼 데이터를 객체로 변환
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.type = 'recruitment'; // 데이터 타입 구분자 추가

        // '기타' 분야 처리: 메인 field 값에 기타 상세 내용을 합치거나 대체
        if (data.field === 'other' && data.other_field) {
            data.field = `기타: ${data.other_field}`;
        }

        // 학번 4자리 유효성 검사 (서브미션 전 재확인)
        const studentIdRegex = /^\d{4}$/;
        if (!studentIdRegex.test(data.student_id)) {
            alert("학번은 숫자 4자리로 입력해주세요. (예: 2312)");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
            return;
        }

        console.log("제출될 데이터:", data);

        // --- [중요] 여기에 구글 앱스 스크립트 배포 후 받은 URL을 넣으세요 ---
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzBHxUU4Nx9JcTEagrClAwc8qHVMA0Lmwa6X3Abfr-OEqu4f4gogNkpLntc6nDWvJGI/exec';

        try {
            if (!SCRIPT_URL) {
                console.warn("SCRIPT_URL이 설정되지 않았습니다. 시뮬레이션 모드로 동작합니다.");
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // CORS 에러 방지 (응답 읽기 포기)
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    }
                });

                // no-cors는 에러 없이 여기까지 오면 전송은 된 것으로 간주함
                console.log("전송 완료 (응답 확인 불가)");
            }

            // 2. 성공 처리 애니메이션
            form.style.opacity = '0';
            form.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                form.classList.add('hidden');
                successMessage.classList.remove('hidden');
                console.log("축하합니다! 지원서가 성공적으로 접수되었습니다.");
            }, 500);

        } catch (error) {
            console.error("제출 실패:", error);
            alert("서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    });

    // 입력 필드 상호작용 (마우스 위치에 따른 입체 효과)
    const card = document.querySelector('.join-form-card');
    const mouseHandler = (e) => {
        const xAxis = (window.innerWidth / 2 - e.clientX) / 50;
        const yAxis = (window.innerHeight / 2 - e.clientY) / 50;

        if (card) {
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    };

    if (!('ontouchstart' in window)) {
        document.addEventListener('mousemove', mouseHandler);
    }

    // --- Modal Logic ---
    const modal = document.getElementById('awards-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('modal-cancel-btn');
    const confirmModalBtn = document.getElementById('modal-confirm-btn');
    const hiddenInput = document.getElementById('awards-career');
    const modalInput = document.getElementById('awards-input');

    if (modal && openModalBtn) {
        // Open Modal
        openModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            // Slight delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                modal.classList.add('active');
                modalInput.focus();
            }, 10);

            // Pre-fill modal with existing data if any
            modalInput.value = hiddenInput.value;
        });

        // Close Function
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300); // Wait for transition
        };

        closeModalBtn.addEventListener('click', closeModal);

        // Confirm (Save) Function
        confirmModalBtn.addEventListener('click', () => {
            const content = modalInput.value.trim();
            hiddenInput.value = content;

            if (content.length > 0) {
                openModalBtn.innerText = "✓ 수상 및 경력 수정하기 (내용 있음)";
                openModalBtn.style.background = "rgba(4, 217, 217, 0.2)";
                openModalBtn.style.borderColor = "var(--color-cyan)";
            } else {
                openModalBtn.innerText = "+ 수상 및 경력 추가하기 (선택)";
                openModalBtn.style.background = "rgba(15, 23, 42, 0.6)";
                openModalBtn.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }
            closeModal();
        });

        // Close on clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
});

// CSS 로딩 스피너 동적 추가
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 0.8s linear infinite;
        display: inline-block;
        vertical-align: middle;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
