function initHomepageMap() {
    const chuncheon = {
        lat: 37.8813,
        lng: 127.7298
    };

    const map = new google.maps.Map(
        document.getElementById('homepage-map'),
        {
            center: chuncheon,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        }
    );

    new google.maps.Marker({
        map,
        position: chuncheon,
        title: '춘천'
    });
}

function loadGoogleMaps() {
    const apiKey = window.GOOGLE_MAPS_API_KEY?.trim();
    const mapStatus = document.getElementById('homepage-map-status');

    if (!apiKey) {
        mapStatus.textContent = 'Google Maps API 키가 없어 미니 맵이 비활성화되었습니다.';
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

loadGoogleMaps();
