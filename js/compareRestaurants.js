const CSV_PATH =
    '../전국_음식점_정보csv/filter_file_Gyo_dong_JS_geocoded.csv';

// 공백, 괄호, 특수문자, 대소문자 차이를 제거합니다.
function normalizeRestaurantName(name = '') {
    return name
        .normalize('NFC')
        .toLowerCase()
        .replace(/\([^)]*\)/g, '')
        .replace(/[^가-힣a-z0-9]/g, '');
}

// 쉼표가 포함된 CSV도 처리하는 간단한 CSV 파서입니다.
function parseCsvLine(line) {
    const values = [];
    let value = '';
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];

        if (character === '"') {
            // CSV 안의 ""는 실제 큰따옴표 한 개를 의미합니다.
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

    const headers = parseCsvLine(lines[0]);

    return lines.slice(1).map(line => {
        const values = parseCsvLine(line);

        return Object.fromEntries(
            headers.map((header, index) => [
                header.trim(),
                values[index] ?? ''
            ])
        );
    });
}

// restaurantData.js의 교동 음식점을 하나의 배열로 합칩니다.
function getGyodongRestaurants() {
    const gyodongData = window.restaurantData?.교동 || {};

    return Object.entries(gyodongData).flatMap(
        ([category, restaurants]) =>
            restaurants.map(restaurant => ({
                ...restaurant,
                category
            }))
    );
}

async function compareRestaurants() {
    const summary = document.getElementById('summary');
    const resultBody = document.getElementById('comparison-result');

    try {
        const response = await fetch(CSV_PATH);

        if (!response.ok) {
            throw new Error(`CSV 요청 실패: ${response.status}`);
        }

        const csvText = await response.text();
        const csvRestaurants = parseCsv(csvText);
        const jsRestaurants = getGyodongRestaurants();

        // CSV 사업장명을 검색하기 쉽게 Map으로 만듭니다.
        const csvRestaurantMap = new Map();

        csvRestaurants.forEach(restaurant => {
            const normalizedName =
                normalizeRestaurantName(restaurant['사업장명']);

            if (!csvRestaurantMap.has(normalizedName)) {
                csvRestaurantMap.set(normalizedName, []);
            }

            csvRestaurantMap.get(normalizedName).push(restaurant);
        });

        const matches = [];

        jsRestaurants.forEach(jsRestaurant => {
            const normalizedName =
                normalizeRestaurantName(jsRestaurant.name);

            const csvMatches =
                csvRestaurantMap.get(normalizedName) || [];

            csvMatches.forEach(csvRestaurant => {
                matches.push({
                    name: jsRestaurant.name,
                    category: jsRestaurant.category,
                    jsAddress: jsRestaurant.address,
                    csvAddress:
                        csvRestaurant['변환주소'] ||
                        csvRestaurant['지번주소'],
                    latitude: csvRestaurant['위도'],
                    longitude: csvRestaurant['경도']
                });
            });
        });

        summary.textContent =
            `JS 음식점 ${jsRestaurants.length}개 중 ` +
            `CSV와 이름이 겹치는 음식점은 ${matches.length}개입니다.`;

        if (matches.length === 0) {
            resultBody.innerHTML = `
                <tr>
                    <td colspan="6">겹치는 음식점이 없습니다.</td>
                </tr>
            `;
            return;
        }

        resultBody.innerHTML = matches.map(restaurant => `
            <tr>
                <td>${restaurant.name}</td>
                <td>${restaurant.category}</td>
                <td>${restaurant.jsAddress}</td>
                <td>${restaurant.csvAddress}</td>
                <td>${restaurant.latitude}</td>
                <td>${restaurant.longitude}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        summary.textContent =
            `비교 중 오류가 발생했습니다: ${error.message}`;
    }
}

compareRestaurants();