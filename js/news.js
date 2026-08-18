// 핵심 역할: 새로운 소식 페이지에서 보여줄 기사 목록과 글쓰기 기능을 관리
// 목적: 정적인 콘텐츠를 카드 형태로 렌더링하고, 사용자 입력으로 새 소식을 추가 가능하게 함
// 흐름: 기사 배열 -> 페이지별 분할 -> HTML 생성 -> 모달 제출 -> 목록 갱신

// 초기 소식. 저장소가 비어 있을 때 한 번만 심는 씨앗 데이터.
const INITIAL_NEWS = [
  {
    tag: '신규',
    title: '춘천 동네 맛집 10곳을 새로 소개합니다',
    content: '이번 주에는 동네별로 꼭 가볼 만한 식당을 골라 새 리스트를 공개했습니다. 분위기와 가격대, 추천 메뉴까지 한 번에 확인할 수 있어요.',
    date: '2026.08.14'
  },
  {
    tag: '이벤트',
    title: '여름 휴가 시즌, 인기 식당 할인 이벤트 시작',
    content: '주말과 연휴 동안 자주 찾는 음식점들에서 특별 할인 혜택을 제공하고 있습니다. 빠르게 예약하고 가볍게 즐겨보세요.',
    date: '2026.08.12'
  },
  {
    tag: '추천',
    title: '가성비 좋은 한 끼 식사 장소 TOP 5',
    content: '무난한 가격에 만족스러운 맛을 느낄 수 있는 식당들을 정리했습니다. 점심시간에 빠르게 떠나기 좋은 곳 위주로 골랐습니다.',
    date: '2026.08.09'
  },
  {
    tag: '리뷰',
    title: '춘천 로컬 맛집 리뷰, 이번엔 브런치 카페 편',
    content: '오전 여유 시간에 가볍게 들르기 좋은 브런치 카페들을 정리해봤습니다. 분위기와 메뉴 추천까지 함께 확인할 수 있어요.',
    date: '2026.08.05'
  },
  {
    tag: '프로모션',
    title: '새로운 지도 뷰로 더 쉽게 맛집 찾기',
    content: '지도 기반으로 주변 맛집을 더 빠르게 확인할 수 있는 기능이 오픈되었습니다. 동네별 필터와 거리 기준으로 편하게 탐색해보세요.',
    date: '2026.08.01'
  },
  {
    tag: '신규',
    title: '주말 데이트 코스 추천 장소가 업데이트됐어요',
    content: '저녁 식사 후 산책하기 좋은 카페와 데이트 코스 루트를 함께 정리해보았습니다. 분위기 좋은 곳을 중심으로 추천합니다.',
    date: '2026.07.28'
  },
  {
    tag: '이벤트',
    title: '춘천 지역 음식 축제 일정 안내',
    content: '이번 달 지역 음식 축제와 체험 프로그램을 한눈에 볼 수 있도록 일정을 정리해드립니다. 놓치지 말고 미리 확인해보세요.',
    date: '2026.07.23'
  },
  {
    tag: '추천',
    title: '애정하는 커피숍과 디저트 맛집 조합 추천',
    content: '오후에 가볍게 쉬기 좋은 카페와 달콤한 디저트를 함께 즐길 수 있는 조합을 소개합니다. 느긋한 시간 보내기에 딱 좋아요.',
    date: '2026.07.19'
  },
  {
    tag: '리뷰',
    title: '춘천 막걸리집 추천, 한적한 분위기 좋아요',
    content: '도시를 벗어나 조용한 분위기에서 술 한잔 하기 좋은 곳들을 발굴해봤습니다. 친구들과 가볍게 즐기기에 좋습니다.',
    date: '2026.07.15'
  },
  {
    tag: '신규',
    title: '신상 식당 오픈 소식, 이번 달 인기 업소 모음',
    content: '새로 오픈한 식당들과 인근 인기 업소를 한 번에 정리해드렸습니다. 새로 생긴 공간을 먼저 확인해보세요.',
    date: '2026.07.10'
  }
];

// 화면에 쓰이는 목록. loadPosts()가 저장소 값으로 통째로 교체하므로 let.
let newsItems = [];

// 공지사항과 키가 겹치면 두 페이지의 글이 섞임
const POSTS_STORAGE_KEY = 'newsPosts';

function savePosts() {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(newsItems));
}

function loadPosts() {
  const saved = localStorage.getItem(POSTS_STORAGE_KEY);

  // null = 키 자체가 없음(첫 방문). '[]' = 저장 후 전부 삭제한 상태.
  // !saved로 검사하면 두 경우가 섞여 지운 소식이 되살아남.
  if (saved === null) {
    // 삭제하려면 글마다 식별자가 필요한데 초기 데이터에는 없으므로 여기서 부여
    newsItems = INITIAL_NEWS.map((item, index) => ({ ...item, id: index + 1 }));
    savePosts();
    return;
  }

  try {
    const parsed = JSON.parse(saved);

    // JSON.parse는 배열이 아닌 값도 통과시킴 — 배열이 아니면 아래 slice/map이 전부 터짐
    newsItems = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('소식 목록을 읽지 못했습니다.', error);
    newsItems = [];
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

// 현재 페이지에 맞는 뉴스 범위를 잘라서 가져옵니다.
function getPaginatedNews() {
  const start = (currentPage - 1) * pageSize;
  return newsItems.slice(start, start + pageSize);
}

// 하단 페이지 버튼을 만들고, 현재 페이지를 표시합니다.
function renderPagination() {
  if (!announcementPagination) return;

  const totalPages = Math.ceil(newsItems.length / pageSize);
  announcementPagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `announcement-page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderNews();
    });
    announcementPagination.appendChild(btn);
  }
}

// 뉴스 목록을 카드 형태로 렌더링해 화면에 보여줍니다.
function renderNews() {
  if (!announcementList) return;

  const items = getPaginatedNews();
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
      const post = newsItems.find(item => item.id === Number(btn.dataset.id));
      if (post) openEditModal(post);
    });
  });

  // 작성자 개념이 없는 글이라 canDelete 대신 isAdmin으로 판단
  announcementList.querySelectorAll('.announcement-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      // dataset 값은 항상 문자열이라 Number로 바꿔야 비교가 성립
      newsItems = newsItems.filter(item => item.id !== Number(btn.dataset.id));
      savePosts();

      // 마지막 페이지의 마지막 글을 지우면 존재하지 않는 페이지에 남게 됨.
      // 전부 지우면 totalPages가 0이 되므로 바닥을 1로 막음.
      const totalPages = Math.max(1, Math.ceil(newsItems.length / pageSize));
      currentPage = Math.min(currentPage, totalPages);

      renderNews();
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
  modalTitle.textContent = '새로운 소식 작성';
  submitBtn.textContent = '등록하기';
  openModal();
}

function openEditModal(post) {
  editingId = post.id;
  modalTitle.textContent = '새로운 소식 수정';
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
      newsItems.unshift({
        id: Date.now(),          // 수정·삭제 대상을 찾기 위한 식별자
        tag: formData.get('tag') || '신규',
        title: formData.get('title') || '제목 없음',
        content: formData.get('content') || '내용 없음',
        date: todayString()
      });
      currentPage = 1;
    } else {
      // find는 배열 안 객체의 참조를 돌려주므로 직접 수정하면 배열에 반영됨
      const post = newsItems.find(item => item.id === editingId);

      // 다른 탭에서 삭제됐을 수 있음. 확인 없이 대입하면 TypeError.
      if (!post) {
        closeModal();
        return;
      }

      post.tag = formData.get('tag') || post.tag;
      post.title = formData.get('title') || post.title;
      post.content = formData.get('content') || post.content;

      // date(작성일)는 덮어쓰지 않음. 덮어쓰면 언제 올라온 소식인지 알 수 없어짐.
      post.updatedAt = todayString();
      // 순서도 유지 — 오타 수정만으로 맨 위에 올라오면 새 소식으로 오인함
    }

    savePosts();
    renderNews();
    closeModal();
  });
}

// 관리자 여부에 따라 삭제 버튼 노출이 달라지므로 목록도 다시 그림
document.addEventListener('auth:changed', renderNews);

loadPosts();
renderNews();
