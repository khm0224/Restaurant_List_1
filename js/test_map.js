const button = document.querySelector('#load-map');
const keyInput = document.querySelector('#api-key');
const status = document.querySelector('#status');

button.addEventListener('click', loadGoogleMaps);
keyInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') loadGoogleMaps();
});

function loadGoogleMaps() {
    const apiKey = keyInput.value.trim();
    if (!apiKey) {
        status.textContent = 'API 키를 입력하세요.';
        keyInput.focus();
        return;
    }

    button.disabled = true;
    status.textContent = '지도를 불러오는 중입니다…';

    window.initMap = initMap;
    window.gm_authFailure = () => {
        status.textContent = '인증에 실패했습니다. API 키와 키 제한 설정을 확인하세요.';
        button.disabled = false;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initMap&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        status.textContent = 'Google Maps 스크립트를 불러오지 못했습니다.';
        button.disabled = false;
    };
    document.head.appendChild(script);
}

function initMap() {
    const seoulCityHall = { lat: 37.5665, lng: 126.9780 };
    const map = new google.maps.Map(document.querySelector('#map'), {
        center: seoulCityHall,
        zoom: 15,
    });

    new google.maps.Marker({
        position: seoulCityHall,
        map,
        title: '서울특별시청',
    });

    status.textContent = '로드 성공: 서울특별시청을 표시하고 있습니다.';
    keyInput.value = '';
}
