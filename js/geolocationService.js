// 브라우저의 Geolocation API를 사용해 사용자의 현재 위치를 조회합니다.
(function () {
    let watchId = null;

    const DEFAULT_OPTIONS = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    function getErrorMessage(error) {
        switch (error?.code) {
            case 1:
                return '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해 주세요.';
            case 2:
                return '현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.';
            case 3:
                return '현재 위치를 확인하는 데 시간이 너무 오래 걸렸습니다.';
            default:
                return '현재 위치를 불러오지 못했습니다.';
        }
    }

    function getCurrentPosition(options = {}) {
        if (!navigator.geolocation) {
            return Promise.reject(new Error('이 브라우저는 현재 위치 기능을 지원하지 않습니다.'));
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                }),
                error => reject(new Error(getErrorMessage(error))),
                { ...DEFAULT_OPTIONS, ...options }
            );
        });
    }

    function startWatching(onPosition, onError, options = {}) {
        if (!navigator.geolocation) {
            throw new Error('이 브라우저는 현재 위치 기능을 지원하지 않습니다.');
        }

        if (watchId !== null) {
            return watchId;
        }

        watchId = navigator.geolocation.watchPosition(
            position => onPosition({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            }),
            error => onError(new Error(getErrorMessage(error))),
            { ...DEFAULT_OPTIONS, ...options }
        );

        return watchId;
    }

    function stopWatching() {
        if (watchId === null || !navigator.geolocation) {
            return;
        }

        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    function isWatching() {
        return watchId !== null;
    }

    window.GeolocationService = {
        getCurrentPosition,
        startWatching,
        stopWatching,
        isWatching
    };
})();
