// 카카오모빌리티 자동차 길찾기 API 호출을 한 곳에서 관리합니다.
(function () {
    const DIRECTIONS_ENDPOINT = 'https://apis-navi.kakaomobility.com/v1/directions';

    function getApiKey() {
        const apiKey = window.Kakao_Rest_API_KEY?.trim();

        if (!/^[0-9a-f]{32}$/i.test(apiKey || '')) {
            throw new Error('유효한 Kakao REST API 키가 없습니다.');
        }

        return apiKey;
    }

    async function findDrivingRoute(origin, destination) {
        const query = new URLSearchParams({
            origin: `${origin.longitude},${origin.latitude}`,
            destination: `${destination.longitude},${destination.latitude}`,
            priority: 'RECOMMEND',
            alternatives: 'false',
            road_details: 'false'
        });
        const response = await fetch(`${DIRECTIONS_ENDPOINT}?${query}`, {
            headers: {
                Authorization: `KakaoAK ${getApiKey()}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('길찾기 API 인증에 실패했습니다. REST 키와 카카오모빌리티 사용 설정을 확인하세요.');
            }
            throw new Error(`길찾기 요청에 실패했습니다. (${response.status})`);
        }

        const data = await response.json();
        const route = data.routes?.[0];

        if (!route || route.result_code !== 0) {
            throw new Error(route?.result_msg || '탐색할 수 있는 자동차 경로가 없습니다.');
        }

        const points = [];
        route.sections?.forEach(section => {
            section.roads?.forEach(road => {
                for (let index = 0; index < road.vertexes.length; index += 2) {
                    points.push({
                        longitude: road.vertexes[index],
                        latitude: road.vertexes[index + 1]
                    });
                }
            });
        });

        if (points.length < 2) {
            throw new Error('경로 좌표를 불러오지 못했습니다.');
        }

        return {
            points,
            distance: route.summary.distance,
            duration: route.summary.duration
        };
    }

    window.DirectionsService = { findDrivingRoute };
})();
