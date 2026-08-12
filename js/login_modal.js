document.addEventListener('DOMContentLoaded', () => {
            const loginBtn = document.getElementById('loginBtn');
            const loginModal = document.getElementById('loginModal');
            const closeBtn = document.getElementById('closeBtn');

            // 로그인 아이콘 클릭 시 모달 열기
            loginBtn.addEventListener('click', () => {
                loginModal.classList.add('active');
            });

            // X 버튼 클릭 시 모달 닫기
            closeBtn.addEventListener('click', () => {
                loginModal.classList.remove('active');
            });

            // 모달 바깥 배경 클릭 시 모달 닫기
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    loginModal.classList.remove('active');
                }
            });
        });