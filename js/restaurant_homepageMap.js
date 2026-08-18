// 메인 화면의 작은 Google 지도r기능을 이 js 파일로 이관.
function initHomepageMap() {
    const mapElement = document.getElementById('homepage-map');
    if (!mapElement || typeof google === 'undefined' || !google.maps) {
        return;
    }

    const chuncheon = { lat: 37.8813, lng: 127.7298 };

    const map = new google.maps.Map(mapElement, {
        center: chuncheon,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    new google.maps.Marker({
        map,
        position: chuncheon,
        title: '춘천'
    });
}

// 유효한 API 키가 있을 때만 지도 스크립트를 불러옵니다.
function loadGoogleMaps() {
    const mapStatus = document.getElementById('homepage-map-status');
    const mapElement = document.getElementById('homepage-map');

    if (!mapElement || !mapStatus) {
        return;
    }

    const apiKey = window.GOOGLE_MAPS_API_KEY?.trim();
    const hasValidApiKeyFormat = /^AIza[0-9A-Za-z_-]{30,}$/.test(apiKey || '');

    if (!hasValidApiKeyFormat) {
        mapStatus.textContent = '유효한 Google Maps API 키가 없어 미니 맵이 비활성화되었습니다.';
        mapStatus.classList.add('is-disabled');
        return;
    }

    window.initHomepageMap = initHomepageMap;
    window.gm_authFailure = () => {
        mapStatus.textContent = 'Google Maps 인증에 실패했습니다. API 키 설정을 확인하세요.';
        mapStatus.classList.add('is-error');
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initHomepageMap&v=weekly&language=ko&region=KR`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        mapStatus.textContent = 'Google Maps를 불러오지 못했습니다.';
        mapStatus.classList.add('is-error');
    };
    document.head.appendChild(script);
}

if (document.getElementById('homepage-map')) {
    loadGoogleMaps();
}
