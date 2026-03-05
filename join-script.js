document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recruitment-form');
    const successMessage = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');
    const fieldSelect = document.getElementById('field');
    const otherFieldContainer = document.getElementById('other-field-container');
    const otherFieldInput = document.getElementById('other-field');

    if (!form) return;

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

        const privacyAgreement = document.getElementById('privacy-agreement');
        if (privacyAgreement && !privacyAgreement.checked) {
            alert("개인정보 수집 및 이용에 동의해야 지원이 가능합니다.");
            return;
        }

        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-text">데이터 전송 중...</span> <div class="loading-spinner"></div>';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.type = 'recruitment';

        if (data.field === 'other' && data.other_field) {
            data.field = `기타: ${data.other_field}`;
        }

        const studentIdRegex = /^\d{4}$/;
        if (!studentIdRegex.test(data.student_id)) {
            alert("학번은 숫자 4자리로 입력해주세요. (예: 2312)");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
            return;
        }

        const SCRIPT_URL = window.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxM9lh5FrMSGB1nowP7Q95_9lPddKPVS3Wjpi0JCUecdE9tQcDnvMJsPkwkpzPkLYie8Q/exec';

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                }
            });

            form.style.opacity = '0';
            form.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                form.classList.add('hidden');
                successMessage.classList.remove('hidden');
            }, 500);

        } catch (error) {
            console.error("제출 실패:", error);
            alert("서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    });

    // --- Modal Logic ---
    const modal = document.getElementById('awards-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('modal-cancel-btn');
    const confirmModalBtn = document.getElementById('modal-confirm-btn');
    const hiddenInput = document.getElementById('awards-career');
    const modalInput = document.getElementById('awards-input');

    if (modal && openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.add('active');
                modalInput.focus();
            }, 10);
            modalInput.value = hiddenInput.value;
            document.body.style.overflow = 'hidden';
        });

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { modal.classList.add('hidden'); }, 300);
        };

        closeModalBtn.addEventListener('click', closeModal);
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
            }
            closeModal();
        });
    }

    // --- Privacy Modal ---
    const privacyModal = document.getElementById('privacy-modal');
    const viewPrivacyBtn = document.getElementById('view-privacy-btn');
    const closePrivacyBtn = document.getElementById('privacy-close-btn');

    if (privacyModal && viewPrivacyBtn) {
        viewPrivacyBtn.addEventListener('click', () => {
            privacyModal.classList.remove('hidden');
            setTimeout(() => privacyModal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        });
        const closeP = () => {
            privacyModal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => privacyModal.classList.add('hidden'), 300);
        };
        closePrivacyBtn.addEventListener('click', closeP);
    }
});
