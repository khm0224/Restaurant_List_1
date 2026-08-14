const newsItems = [
  {
    tag: '신규',
    title: '춘천 동네 맛집 10곳을 새로 소개합니다',
    content: '이번 주에는 동네별로 꼭 가볼 만한 식당을 골라 새 리스트를 공개했습니다. 분위기와 가격대, 추천 메뉴까지 한 번에 확인할 수 있어요.',
    date: '2026.08.14',
    author: '봄내로그 팀'
  },
  {
    tag: '이벤트',
    title: '여름 휴가 시즌, 인기 식당 할인 이벤트 시작',
    content: '주말과 연휴 동안 자주 찾는 음식점들에서 특별 할인 혜택을 제공하고 있습니다. 빠르게 예약하고 가볍게 즐겨보세요.',
    date: '2026.08.12',
    author: '운영팀'
  },
  {
    tag: '추천',
    title: '가성비 좋은 한 끼 식사 장소 TOP 5',
    content: '무난한 가격에 만족스러운 맛을 느낄 수 있는 식당들을 정리했습니다. 점심시간에 빠르게 떠나기 좋은 곳 위주로 골랐습니다.',
    date: '2026.08.09',
    author: '맛집 큐레이터'
  },
  {
    tag: '리뷰',
    title: '춘천 로컬 맛집 리뷰, 이번엔 브런치 카페 편',
    content: '오전 여유 시간에 가볍게 들르기 좋은 브런치 카페들을 정리해봤습니다. 분위기와 메뉴 추천까지 함께 확인할 수 있어요.',
    date: '2026.08.05',
    author: '리뷰팀'
  },
  {
    tag: '프로모션',
    title: '새로운 지도 뷰로 더 쉽게 맛집 찾기',
    content: '지도 기반으로 주변 맛집을 더 빠르게 확인할 수 있는 기능이 오픈되었습니다. 동네별 필터와 거리 기준으로 편하게 탐색해보세요.',
    date: '2026.08.01',
    author: '개발팀'
  },
  {
    tag: '신규',
    title: '주말 데이트 코스 추천 장소가 업데이트됐어요',
    content: '저녁 식사 후 산책하기 좋은 카페와 데이트 코스 루트를 함께 정리해보았습니다. 분위기 좋은 곳을 중심으로 추천합니다.',
    date: '2026.07.28',
    author: '추천팀'
  },
  {
    tag: '이벤트',
    title: '춘천 지역 음식 축제 일정 안내',
    content: '이번 달 지역 음식 축제와 체험 프로그램을 한눈에 볼 수 있도록 일정을 정리해드립니다. 놓치지 말고 미리 확인해보세요.',
    date: '2026.07.23',
    author: '지역팀'
  },
  {
    tag: '추천',
    title: '애정하는 커피숍과 디저트 맛집 조합 추천',
    content: '오후에 가볍게 쉬기 좋은 카페와 달콤한 디저트를 함께 즐길 수 있는 조합을 소개합니다. 느긋한 시간 보내기에 딱 좋아요.',
    date: '2026.07.19',
    author: '추천팀'
  },
  {
    tag: '리뷰',
    title: '춘천 막걸리집 추천, 한적한 분위기 좋아요',
    content: '도시를 벗어나 조용한 분위기에서 술 한잔 하기 좋은 곳들을 발굴해봤습니다. 친구들과 가볍게 즐기기에 좋습니다.',
    date: '2026.07.15',
    author: '리뷰팀'
  },
  {
    tag: '신규',
    title: '신상 식당 오픈 소식, 이번 달 인기 업소 모음',
    content: '새로 오픈한 식당들과 인근 인기 업소를 한 번에 정리해드렸습니다. 새로 생긴 공간을 먼저 확인해보세요.',
    date: '2026.07.10',
    author: '봄내로그 팀'
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

function getPaginatedNews() {
  const start = (currentPage - 1) * pageSize;
  return newsItems.slice(start, start + pageSize);
}

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

function renderNews() {
  if (!announcementList) return;

  const items = getPaginatedNews();
  announcementList.innerHTML = items.map((item) => `
    <article class="announcement-card">
      <div class="announcement-tag">${item.tag}</div>
      <h2>${item.title}</h2>
      <p>${item.content}</p>
      <div class="announcement-meta">
        <span>${item.date}</span>
        <span>${item.author}</span>
      </div>
    </article>
  `).join('');

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
}

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

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const newItem = {
      tag: formData.get('tag') || '신규',
      title: formData.get('title') || '제목 없음',
      content: formData.get('content') || '내용 없음',
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      author: '봄내로그 팀'
    };

    newsItems.unshift(newItem);
    currentPage = 1;
    renderNews();
    closeModal();
  });
}

renderNews();
