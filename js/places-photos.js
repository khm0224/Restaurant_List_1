async function fetchNearbyRestaurantsWithPhotos(lat, lng, radiusMeters = 1000) {
    const apiKey = window.GOOGLE_MAPS_API_KEY;

    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            // 응답에 어떤 필드를 받을지 명시해야 함 (photos 필수)
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.photos'
        },
        body: JSON.stringify({
            includedTypes: ['restaurant'],
            maxResultCount: 10,
            locationRestriction: {
                circle: {
                    center: { latitude: lat, longitude: lng },
                    radius: radiusMeters
                }
            }
        })
    });

    const data = await res.json();
    if (!data.places) return [];

    // 각 장소의 photo name -> 실제 이미지 URL로 변환
    return data.places.map(place => {
        const photoName = place.photos?.[0]?.name; // "places/xxx/photos/yyy"
        const photoUrl = photoName
            ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=500&key=${apiKey}`
            : null;

        return {
            name: place.displayName?.text ?? '이름 없음',
            address: place.formattedAddress ?? '',
            rating: place.rating ?? null,
            photoUrl // 이걸 <img src>나 background-image에 바로 사용
        };
    });
}

