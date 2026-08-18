// 현재 위치 또는 사용자가 선택한 위치와 음식점 사이의 직선거리를 계산합니다.
(function () {
    const EARTH_RADIUS_KM = 6371.0088;

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function readCoordinate(target, primaryKey, fallbackKey) {
        const value = Number(target?.[primaryKey] ?? target?.[fallbackKey]);
        return Number.isFinite(value) ? value : null;
    }

    function normalizeLocation(location) {
        const latitude = readCoordinate(location, 'latitude', 'lat');
        const longitude = readCoordinate(location, 'longitude', 'lng');

        if (latitude === null || longitude === null) {
            throw new TypeError('거리 계산을 위해 유효한 위도와 경도가 필요합니다.');
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new RangeError('위도 또는 경도가 허용 범위를 벗어났습니다.');
        }

        return { latitude, longitude };
    }

    // 두 좌표 사이의 대권거리를 Haversine 공식으로 계산해 km 단위로 반환합니다.
    function calculateDistanceKm(origin, destination) {
        const start = normalizeLocation(origin);
        const end = normalizeLocation(destination);
        const latitudeDifference = toRadians(end.latitude - start.latitude);
        const longitudeDifference = toRadians(end.longitude - start.longitude);
        const startLatitude = toRadians(start.latitude);
        const endLatitude = toRadians(end.latitude);

        const haversine =
            Math.sin(latitudeDifference / 2) ** 2 +
            Math.cos(startLatitude) *
            Math.cos(endLatitude) *
            Math.sin(longitudeDifference / 2) ** 2;

        return EARTH_RADIUS_KM * 2 * Math.atan2(
            Math.sqrt(haversine),
            Math.sqrt(1 - haversine)
        );
    }

    function formatDistance(distanceKm) {
        if (!Number.isFinite(distanceKm) || distanceKm < 0) {
            return '';
        }

        if (distanceKm < 1) {
            return `${Math.round(distanceKm * 1000)}m`;
        }

        return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
    }

    // 좌표가 있는 음식점만 계산하고 선택 반경 안의 결과를 가까운 순서로 반환합니다.
    function findNearby({
        origin,
        restaurants = [],
        radiusKm = 3,
        limit = Infinity,
        sortBy = 'distance'
    } = {}) {
        normalizeLocation(origin);

        const normalizedRadius = Number(radiusKm);
        const normalizedLimit = Number(limit);

        if (!Number.isFinite(normalizedRadius) || normalizedRadius <= 0) {
            throw new RangeError('검색 반경은 0보다 큰 km 값이어야 합니다.');
        }

        if ((!Number.isFinite(normalizedLimit) && normalizedLimit !== Infinity) || normalizedLimit < 0) {
            throw new RangeError('검색 결과 개수는 0 이상의 값이어야 합니다.');
        }

        return restaurants
            .flatMap(restaurant => {
                try {
                    const distanceKm = calculateDistanceKm(origin, restaurant);

                    if (distanceKm > normalizedRadius) {
                        return [];
                    }

                    return [{
                        ...restaurant,
                        distanceKm,
                        distanceLabel: formatDistance(distanceKm)
                    }];
                } catch (error) {
                    return [];
                }
            })
            .sort((first, second) => sortBy === 'rating'
                ? ratingSort(first, second)
                : distanceSort(first, second))
            .slice(0, normalizedLimit);
    }

    function distanceSort(first, second) {
        return first.distanceKm - second.distanceKm;
    }

    function ratingSort(first, second) {
        return (Number(second.rating) || 0) - (Number(first.rating) || 0) ||
            (Number(second.reviewCount) || 0) - (Number(first.reviewCount) || 0) ||
            distanceSort(first, second);
    }

    window.NearbyRestaurantService = {
        calculateDistanceKm,
        findNearby,
        formatDistance
    };
})();
