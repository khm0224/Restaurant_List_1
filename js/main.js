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

const GOOGLE_MAPS_API_KEY = 'AIzaSyBpntbMN0VUcZ31FeIp7I9RhAyWLS4wk84';

function loadGoogleMaps() {
    window.initHomepageMap = initHomepageMap;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&callback=initHomepageMap&v=weekly&language=ko&region=KR`;
    script.async = true;
    script.defer = true;
    script.onerror = () => console.error('Google Maps 스크립트를 불러오지 못했습니다.');
    document.head.appendChild(script);
}

loadGoogleMaps();
