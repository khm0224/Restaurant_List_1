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

// AIzaSyBpntbMN0VUcZ31FeIp7I9RhAyWLS4wk84