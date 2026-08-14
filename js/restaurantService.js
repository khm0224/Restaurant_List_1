// CSV에서 지도에 표시할 식당 좌표 데이터를 읽어 제공합니다.
(function () {
    const RESTAURANT_CSV_URL = '../전국_음식점_정보csv/filter_file_Gyo_dong_JS_geocoded.csv';
    let restaurantsPromise = null;

    function parseCsvLine(line) {
        const values = [];
        let value = '';
        let insideQuotes = false;

        for (let index = 0; index < line.length; index += 1) {
            const character = line[index];

            if (character === '"') {
                if (insideQuotes && line[index + 1] === '"') {
                    value += '"';
                    index += 1;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (character === ',' && !insideQuotes) {
                values.push(value.trim());
                value = '';
            } else {
                value += character;
            }
        }

        values.push(value.trim());
        return values;
    }

    function parseCsv(csvText) {
        const lines = csvText
            .replace(/^\uFEFF/, '')
            .split(/\r?\n/)
            .filter(line => line.trim() !== '');

        if (lines.length === 0) {
            return [];
        }

        const headers = parseCsvLine(lines[0]);

        return lines.slice(1).map(line => {
            const values = parseCsvLine(line);

            return Object.fromEntries(
                headers.map((header, index) => [header.trim(), values[index] ?? ''])
            );
        });
    }

    function toRestaurant(row, index) {
        const latitude = Number(row['위도']);
        const longitude = Number(row['경도']);

        if (
            row['지오코딩상태'] !== '성공' ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return null;
        }

        return {
            id: `gyodong-${index + 1}`,
            district: '교동',
            category: row['업태구분명'],
            name: row['사업장명'],
            address: row['변환주소'] || row['지번주소'],
            latitude,
            longitude,
            rating: Number(row['평점']) || 0,
            reviewCount: Number(row['리뷰수']) || 0,
            imageUrl: row['이미지URL'] || ''
        };
    }

    async function loadRestaurants() {
        const response = await fetch(RESTAURANT_CSV_URL, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`식당 CSV 파일을 불러오지 못했습니다. (${response.status})`);
        }

        const csvText = await response.text();

        return parseCsv(csvText)
            .map(toRestaurant)
            .filter(Boolean);
    }

    function getRestaurants() {
        if (!restaurantsPromise) {
            restaurantsPromise = loadRestaurants().catch(error => {
                restaurantsPromise = null;
                throw error;
            });
        }

        return restaurantsPromise;
    }

    async function findRestaurant({ id, district, name } = {}) {
        const restaurants = await getRestaurants();

        return restaurants.find(restaurant => {
            if (typeof id === 'string' && restaurant.id === id) {
                return true;
            }

            return restaurant.district === district && restaurant.name === name;
        }) || null;
    }

    window.RestaurantService = {
        getRestaurants,
        findRestaurant
    };
})();
