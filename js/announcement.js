// 핵심 역할: 공지사항 페이지의 목록 데이터, 페이지네이션, 글쓰기 모달 동작을 담당
// 목적: 사용자에게 공지글을 카드형 목록으로 보여주고, 새 글을 추가할 수 있게 함
// 흐름: 배열 데이터 -> 렌더링 -> 페이지 번호 생성 -> 폼 제출 -> 배열 앞쪽에 추가

// 초기 공지. 저장소가 비어 있을 때 한 번만 심는 씨앗 데이터.
const INITIAL_ANNOUNCEMENTS = [
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

// 화면에 쓰이는 목록. loadPosts()가 저장소 값으로 통째로 교체하므로 let.
let announcements = [];

const POSTS_STORAGE_KEY = 'announcementPosts';

function savePosts() {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(announcements));
}

function loadPosts() {
  const saved = localStorage.getItem(POSTS_STORAGE_KEY);

  // null = 키 자체가 없음(첫 방문). '[]' = 저장 후 전부 삭제한 상태.
  // !saved로 검사하면 두 경우가 섞여 지운 공지가 되살아남.
  if (saved === null) {
    // 삭제하려면 글마다 식별자가 필요한데 초기 데이터에는 없으므로 여기서 부여
    announcements = INITIAL_ANNOUNCEMENTS.map((item, index) => ({ ...item, id: index + 1 }));
    savePosts();
    return;
  }

  try {
    const parsed = JSON.parse(saved);

    // JSON.parse는 배열이 아닌 값도 통과시킴 — 배열이 아니면 아래 slice/map이 전부 터짐
    announcements = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('공지 목록을 읽지 못했습니다.', error);
    announcements = [];
  }
}

const announcementList = document.getElementById('announcementList');
const announcementPagination = document.getElementById('announcementPagination');
const modal = document.getElementById('announcementModal');
const openModalBtn = document.getElementById('openAnnouncementModal');
const closeModalBtn = document.getElementById('closeAnnouncementModal');
const cancelModalBtn = document.getElementById('cancelAnnouncementModal');
const form = document.getElementById('announcementForm');
const modalTitle = document.getElementById('announcementModalTitle');
const submitBtn = form ? form.querySelector('.submit-btn') : null;
const pageSize = 5;
let currentPage = 1;

// 수정 중인 글의 id. 새 글이면 null.
// 화면에 드러나지 않는 상태라 DOM이 아니라 변수에 둠.
let editingId = null;

// '2026.08.18' 형태. 작성일·수정일 세 곳에서 쓰므로 함수로 묶음.
function todayString() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '.');
}

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
    <article class="announcement-card" data-id="${item.id}">
      <div class="announcement-tag">${item.tag}</div>
      <h2>${item.title}</h2>
      <p>${item.content}</p>
      <div class="announcement-meta">
        <span>${item.date}</span>
        ${item.updatedAt ? `<span class="announcement-updated">· 수정 ${item.updatedAt}</span>` : ''}  
        ${isAdmin() ? `<button class="announcement-edit" type="button" data-id="${item.id}">수정</button>` : ''}
        ${isAdmin() ? `<button class="announcement-delete" type="button" data-id="${item.id}">삭제</button>` : ''}
      </div>
    </article>
  `).join('');

  announcementList.querySelectorAll('.announcement-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const post = announcements.find(item => item.id === Number(btn.dataset.id));
      if (post) openEditModal(post);
    });
  });

  // 작성자 개념이 없는 글이라 canDelete 대신 isAdmin으로 판단
  announcementList.querySelectorAll('.announcement-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      // dataset 값은 항상 문자열이라 Number로 바꿔야 비교가 성립
      announcements = announcements.filter(item => item.id !== Number(btn.dataset.id));
      savePosts();

      // 마지막 페이지의 마지막 글을 지우면 존재하지 않는 페이지에 남게 됨.
      // 전부 지우면 totalPages가 0이 되므로 바닥을 1로 막음.
      const totalPages = Math.max(1, Math.ceil(announcements.length / pageSize));
      currentPage = Math.min(currentPage, totalPages);

      renderAnnouncements();
    });
  });

  renderPagination();
}

function openModal() {
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  if (form) form.reset();

  // 수정 상태도 함께 정리.
  // 안 지우면 수정을 취소한 뒤 새 글을 쓸 때 그 글이 덮어써짐.
  // 닫는 경로가 넷(X · 취소 · 배경 · 저장 완료)이라 한 곳에 모아둠.
  editingId = null;
}

// 같은 모달을 작성·수정 두 모드로 씀. 입력 항목이 같아 폼을 두 벌 둘 이유가 없음.
function openWriteModal() {
  editingId = null;
  modalTitle.textContent = '새 공지사항 작성';
  submitBtn.textContent = '등록하기';
  openModal();
}

function openEditModal(post) {
  editingId = post.id;
  modalTitle.textContent = '공지사항 수정';
  submitBtn.textContent = '수정하기';

  // select는 option에 없는 값을 넣으면 에러 없이 빈 값이 됨
  document.getElementById('announcementTag').value = post.tag;
  document.getElementById('announcementTitle').value = post.title;
  document.getElementById('announcementContent').value = post.content;

  openModal();
}

if (openModalBtn) {
  openModalBtn.addEventListener('click', openWriteModal);
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

    if (editingId === null) {
      announcements.unshift({
        id: Date.now(),          // 수정·삭제 대상을 찾기 위한 식별자
        tag: formData.get('tag') || '공지',
        title: formData.get('title') || '제목 없음',
        content: formData.get('content') || '내용 없음',
        date: todayString()
      });
      currentPage = 1;
    } else {
      // find는 배열 안 객체의 참조를 돌려주므로 직접 수정하면 배열에 반영됨
      const post = announcements.find(item => item.id === editingId);

      // 다른 탭에서 삭제됐을 수 있음. 확인 없이 대입하면 TypeError.
      if (!post) {
        closeModal();
        return;
      }

      post.tag = formData.get('tag') || post.tag;
      post.title = formData.get('title') || post.title;
      post.content = formData.get('content') || post.content;

      // date(작성일)는 덮어쓰지 않음. 덮어쓰면 언제 올라온 공지인지 알 수 없어짐.
      post.updatedAt = todayString();
      // 순서도 유지 — 오타 수정만으로 맨 위에 올라오면 새 공지로 오인함
    }

    savePosts();
    renderAnnouncements();
    closeModal();
  });
}

// 관리자 여부에 따라 삭제 버튼 노출이 달라지므로 목록도 다시 그림
document.addEventListener('auth:changed', renderAnnouncements);

loadPosts();
renderAnnouncements();
