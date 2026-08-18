// 핵심 역할: 공지사항 페이지의 목록 데이터, 페이지네이션, 글쓰기 모달 동작을 담당
// 목적: 사용자에게 공지글을 카드형 목록으로 보여주고, 새 글을 추가할 수 있게 함
// 흐름: 배열 데이터 -> 렌더링 -> 페이지 번호 생성 -> 폼 제출 -> 배열 앞쪽에 추가

const announcements = [
  {
    tag: '공지',
    title: '맛집 추천 서비스 이용 가이드 업데이트 안내',
    content: '새로운 지역별 추천 기능과 리뷰 필터가 추가되어 더 편리하게 맛집을 찾을 수 있습니다.',
    date: '2026.08.14'
  },
  {
    tag: '이벤트',
    title: '여름 휴가철 추천 맛집 이벤트가 시작됩니다',
    content: '7월부터 8월까지 인기 식당 리스트를 한눈에 볼 수 있는 특별 페이지를 운영합니다.',
    date: '2026.08.08'
  },
  {
    tag: '업데이트',
    title: '검색 속도 개선 및 사용자 인터페이스 정리 안내',
    content: '검색 엔진 성능을 높이고, 모바일 환경에서의 레이아웃을 정리해 더 깔끔하게 이용하실 수 있습니다.',
    date: '2026.08.01'
  },
  {
    tag: '점검',
    title: '시스템 점검으로 인한 일부 서비스 일시 중지 안내',
    content: '8월 3일 오전 2시부터 4시까지 서버 점검이 예정되어 있어 일부 기능이 일시적으로 제한됩니다.',
    date: '2026.07.28'
  },
  {
    tag: '공지',
    title: '회원 등급별 혜택 안내 및 새 리뷰 기능 추가',
    content: '리뷰 작성 보상, 쿠폰 혜택, 추천 리스트 저장 기능이 새로 오픈되며 많은 관심 부탁드립니다.',
    date: '2026.07.21'
  },
  {
    tag: '업데이트',
    title: '지도 기반 맛집 추천 기능이 새로 추가되었습니다',
    content: '위치 기반으로 가까운 맛집을 빠르게 찾을 수 있도록 지도 뷰를 개선했습니다.',
    date: '2026.07.15'
  },
  {
    tag: '공지',
    title: '회원 리뷰 신고 정책 안내',
    content: '허위 리뷰 및 불법 콘텐츠에 대한 신고 절차를 정리해 보다 안전한 커뮤니티를 운영합니다.',
    date: '2026.07.10'
  },
  {
    tag: '이벤트',
    title: '주말 맛집 할인 이벤트 안내',
    content: '이번 주말 인기 식당 20곳에서 최대 20% 할인 혜택을 제공합니다.',
    date: '2026.07.04'
  },
  {
    tag: '공지',
    title: '개인정보 처리방침 일부 개정 안내',
    content: '서비스 품질 향상을 위해 일부 개인정보 처리 기준이 변경되어 사전 안내드립니다.',
    date: '2026.06.28'
  },
  {
    tag: '업데이트',
    title: '리뷰 작성 UI 개선 및 사진 업로드 기능 추가',
    content: '사진 첨부 경험을 더 편하게 만들고, 리뷰 작성 폼을 정리해 사용자 편의를 강화했습니다.',
    date: '2026.06.20'
  }
];

const announcementList = document.getElementById('announcementList');
const announcementPagination = document.getElementById('announcementPagination');
const modal = document.getElementById('announcementModal');
const openModalBtn = document.getElementById('openAnnouncementModal');
const closeModalBtn = document.getElementById('closeAnnouncementModal');
const cancelModalBtn = document.getElementById('cancelAnnouncementModal');
const form = document.getElementById('announcementForm');
const pageSize = 5;
let currentPage = 1;

// 현재 페이지 기준으로 보여줄 공지 목록 범위를 계산합니다.
function getPaginatedAnnouncements() {
  const start = (currentPage - 1) * pageSize;
  return announcements.slice(start, start + pageSize);
}

// 페이지 번호 버튼을 만들고 현재 페이지를 강조 표시합니다.
function renderPagination() {
  if (!announcementPagination) return;

  const totalPages = Math.ceil(announcements.length / pageSize);
  announcementPagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `announcement-page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderAnnouncements();
    });
    announcementPagination.appendChild(btn);
  }
}

// 공지 목록을 실제 HTML 카드로 그려서 화면에 표시합니다.
function renderAnnouncements() {
  if (!announcementList) return;

  const items = getPaginatedAnnouncements();
  announcementList.innerHTML = items.map((item) => `
    <article class="announcement-card">
      <div class="announcement-tag">${item.tag}</div>
      <h2>${item.title}</h2>
      <p>${item.content}</p>
      <div class="announcement-meta">
        <span>${item.date}</span>
      </div>
    </article>
  `).join('');

  renderPagination();
}

// 글쓰기 모달을 열고 닫는 동작을 처리합니다.
function openModal() {
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

// 입력 폼을 초기화하고 모달을 닫습니다.
function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  if (form) form.reset();
}

// 버튼 클릭 이벤트를 연결해 모달 열기/닫기를 제어합니다.
if (openModalBtn) {
  openModalBtn.addEventListener('click', openModal);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
}

if (cancelModalBtn) {
  cancelModalBtn.addEventListener('click', closeModal);
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

// 글쓰기는 관리자 전용.
// 화면에서 감출 뿐이라 진짜 권한 검사는 아님(서버 부재).
function updateWriteButtonState() {
  if (!openModalBtn) return;

  openModalBtn.hidden = !isAdmin();
}

document.addEventListener('auth:changed', updateWriteButtonState);
updateWriteButtonState();

// 폼 제출 시 새 공지 항목을 배열에 추가하고 화면을 갱신합니다.
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // 버튼을 감추는 것만으로는 막히지 않음 — 제출 시점에 다시 확인
    if (!isAdmin()) {
      closeModal();
      updateWriteButtonState();
      return;
    }

    const formData = new FormData(form);
    const newItem = {
      tag: formData.get('tag') || '공지',
      title: formData.get('title') || '제목 없음',
      content: formData.get('content') || '내용 없음',
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.')
    };

    announcements.unshift(newItem);
    currentPage = 1;
    renderAnnouncements();
    closeModal();
  });
}

renderAnnouncements();
