// 동네별 식당 데이터를 전역으로 제공합니다.
// 지금은 교동만 실제 데이터가 채워져 있고, 나머지 동네는 구조만 준비해 두어 나중에 쉽게 추가할 수 있습니다.
const districtNames = ['소양동', '교동', '조운동', '약사명동', '근화동', '후평1동', '후평2동', '후평3동', '효자1동', '효자2동', '효자3동', '석사동', '퇴계동', '강남동', '신사우동'];
const cuisineCategories = ['한식', '일식', '중식', '양식', '디저트'];

window.restaurantData = Object.fromEntries(
    districtNames.map((district) => [
        district,
        Object.fromEntries(cuisineCategories.map((category) => [category, []]))
    ])
);

window.restaurantData.교동 = {
    한식: [
        {
            name: '별채식당', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231005_123%2F1696472919623WzaGd_JPEG%2F1000000405.jpg',
            address: '강원특별자치도 춘천시 삭주로 75', rating: 4.1, reviewCount: 200
        }, // Ok
        {
            name: '대암감자탕 한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190116_54%2F15476330411692TtTa_JPEG%2Ff0RIjYBtUbr7cIpTzNMJNpzh.jpg',
            address: '강원 춘천시 삭주로 67', rating: 3.6, reviewCount: 201
        }, // OK
        {
            name: 'OK분식', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fblogfiles.pstatic.net%2FMjAyNjA0MzBfMjgw%2FMDAxNzc3NTQzNTUzOTQ0.035xoKyWlg0IQBt0Vna27nQnycaJAsYSW-xgMdJ_U0sg.17vRrBk7cPxWBYD33yULzuFaZRt85ZEXJ3eN13JLKM8g.JPEG%2FIMG%EF%BC%BF8603.jpg%2F900x1200',
            address: '강원 춘천시 삭주로 68-1', rating: 3.8, reviewCount: 129
        },
        {
            name: '우영야식', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNjAyMTJfMjcx%2FMDAxNzcwODc3ODA5NjY0.qA64w3vkhdxB6X7Ib8CMHwZYO9gubHfmlA4l9e4EHZ4g.Ih_BCLUaBEyLMIu6LFhpaoWSktfgIwJTkXlYxcoMjxEg.JPEG%2F1000126167.jpg.jpg',
            address: '강원 춘천시 삭주로 64 CU 옆골목 모퉁이', rating: 4.0, reviewCount: 23
        }, // Ok
        {
            name: '구마족발 한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251221_13%2F1766309980767EudkI_JPEG%2FIMG_9078.jpeg',
            address: '강원 춘천시 성심로 7 1층', rating: 4.1, reviewCount: 99
        } // Ok
    ],
    일식: [
        { name: '도쿄라멘춘천한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20180827_164%2F1535346817088xXANi_JPEG%2FMberV62NSww70SV_Ol1AUdJE.jpg', address: '강원 춘천시 삭주로 69', rating: 4.3, reviewCount: 164 }, // Ok
        { name: '미성카츠', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fblogfiles.pstatic.net%2FMjAyNjA2MTlfMjk3%2FMDAxNzgxODMzMzcxNTU3.3xCnfQQCXdO6VQ3bk3BzJIQFkb32hahExtydjgb5GTkg.A1usIa7S185mM9Zag1mqr5sC-yShTHvfj348M6Y24O4g.JPEG%2FKakaoTalk_20260618_193918149_07.jpg%2F1081x1081', address: '강원 춘천시 삭주로 47 1,2층', rating: 4.7, reviewCount: 110 }, // Ok
        { name: '오야초밥', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230419_275%2F1681877591722iv2wT_JPEG%2FA7CBCC0C-8D0B-49B9-BFED-C52E07FD92F9.jpeg', address: '강원 춘천시 삭주로 42 1층', rating: 4.6, reviewCount: 892 }
    ],
    중식: [
        {
            name: '룡의부활', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNTAxMDZfMjQ3%2FMDAxNzM2MTQyNjYxMDE0.rEf1ewXW2i0zfg3PVJwQ4CjQtkEmzj3hXDYiIncNfe0g.qDiBAWrsNELkjl7dkFc-Ko3v7kYe170wfi1ec7139ccg.JPEG%2F6CF313CC-76A5-428C-A407-E608B0543FAB.jpeg', // OK
            address: '강원 춘천시 삭주로70번길 26', rating: 4.2, reviewCount: 39
        },
        {
            name: '화산마라탕 한림대본점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20221104_271%2F1667516749255U4G91_JPEG%2F%25C8%25AD%25BB%25EA.jpg',
            address: '강원 춘천시 삭주로 74 2층 화산마라탕', rating: 4.3, reviewCount: 32
        },
        {
            name: '향리원 마라탕', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20221024_169%2F1666590213785DhpfH_JPEG%2FFD685E72-FF70-4995-8B6A-80D96EA4A5B0.jpeg', // OK
            address: '강원 춘천시 성심로 8 1층', rating: 4.4, reviewCount: 29
        }
    ],
    양식: [
        { name: '피자스쿨', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20221104_75%2F1667537168736caxsv_JPEG%2F%25C7%25C7%25C0%25DA%25BD%25BA%25C4%25F0.jpg', address: '강원 춘천시 삭주로 71 1층', rating: 4.3, reviewCount: 337 },
        { name: '맘스터치한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230829_137%2F1693282401170BAq7o_PNG%2F%25B7%25CE%25B0%25ED_%25C1%25A4%25B9%25E6%25C7%25FC.png', address: '강원 춘천시 성심로 4-1', rating: 3.9, reviewCount: 641 },  // Ok
        { name: '피자알볼로', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250714_90%2F1752464329547ggTD3_JPEG%2F20th-%25B7%25CE%25B0%25ED.jpg', address: '강원 춘천시 삭주로 53', rating: 4.0, reviewCount: 507 },
        { name: '일과사랑', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250408_263%2F17440887298014FuGy_JPEG%2FIMG_0114.jpeg', address: '강원 춘천시 삭주로 51 일과사랑', rating: 4.8, reviewCount: 547 },
        { name: '상린', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190122_22%2F1548143560166e5u8v_JPEG%2FbIiBnooK3aMNrTTbBEjBvcEU.jpeg.jpg', address: '강원 춘천시 교동길17번길 11', rating: 4.2, reviewCount: 667 }  // Ok
    ],
    디저트: [
        {
            name: '와플칸 한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230103_192%2F1672725994779YEyys_JPEG%2F20221125_190125.jpg',  // Ok
            address: '강원 춘천시 삭주로 64 1층', rating: 4.0, reviewCount: 212
        },
        {
            name: '팔공티 한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190601_198%2F15593776457598pm5h_JPEG%2FQGo70m5rYAc-hx1Zqy4FvF7f.jpg',
            address: '강원 춘천시 성심로 4-1', rating: 4.1, reviewCount: 120
        },
        {
            name: '컴포즈커피 춘천한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220818_189%2F1660798795831ImT1K_JPEG%2FKakaoTalk_Moim_79DPRwwu4JkdOlDXR3DTc4WtyLmTrd.jpg',
            address: '강원 춘천시 삭주로 75', rating: 3.9, reviewCount: 12
        },
        {
            name: '빽다방 춘천한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250210_28%2F1739161743794Lm83X_JPEG%2F1000009211.jpg',
            address: '강원 춘천시 삭주로 64 1층', rating: 4.5, reviewCount: 811
        },
        {
            name: '이디야커피 한림대점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNTExMThfMTMx%2FMDAxNzYzNDQxMzkzMzkx.hoqZFCFUmeXcjO_2V-ZyK3o5sS7eKsNTsWDwoHpTkQcg.AN7PXFhUcHCDkB889km_K8VX_zgjhlj9fP0VQzrk8TQg.JPEG%2F20251118_131750.jpg.jpg',
            address: '강원 춘천시 삭주로 62 2,3층', rating: 4.5, reviewCount: 149
        }
    ]
};

window.currentSelectedDistrict = '교동';

window.getRestaurantData = function (category, index, district = window.currentSelectedDistrict || '교동') {
    if (!category || index === undefined || index === null) {
        return null;
    }

    const normalizedIndex = Number(index);
    const districtData = window.restaurantData?.[district];

    if (districtData && Array.isArray(districtData[category])) {
        return districtData[category][normalizedIndex] || null;
    }

    return null;
};

window.setSelectedRestaurant = function (districtOrCategory, categoryOrIndex, maybeIndex) {
    let district = window.currentSelectedDistrict || '교동';
    let category = districtOrCategory;
    let index = categoryOrIndex;

    if (arguments.length >= 3) {
        district = districtOrCategory;
        category = categoryOrIndex;
        index = maybeIndex;
    }

    const store = window.getRestaurantData(category, index, district);
    if (!store) {
        return null;
    }

    const selected = {
        ...store,
        district,
        category,
        id: Number(index)
    };

    sessionStorage.setItem('selectedRestaurant', JSON.stringify(selected));
    return selected;
};

// 카테고리별 임시 메뉴 데이터 (식당 개별 메뉴 정보는 아직 없어서 카테고리 기준으로 대체)
window.menuTemplates = {
    한식: [
        { name: '춘천닭갈비 (1인분)', price: 13000 },
        { name: '메밀막국수', price: 9000 },
        { name: '보쌈정식', price: 22000 },
        { name: '된장찌개', price: 8000 },
        { name: '공기밥', price: 1000 },
        { name: '순두부찌개', price: 8500 },
        { name: '제육볶음', price: 11000 },
        { name: '갈비탕', price: 12000 },
        { name: '비빔밥', price: 9000 },
        { name: '냉면', price: 9500 },
        { name: '족발 (소)', price: 25000 },
        { name: '전골정식', price: 20000 }
    ],
    일식: [
        { name: '모둠초밥', price: 18000 },
        { name: '돈코츠라멘', price: 11000 },
        { name: '가츠동', price: 10000 },
        { name: '우동', price: 8000 },
        { name: '연어사시미', price: 24000 }
    ],
    중식: [
        { name: '짜장면', price: 7000 },
        { name: '짬뽕', price: 8500 },
        { name: '탕수육 (소)', price: 18000 },
        { name: '마파두부밥', price: 9000 },
        { name: '군만두', price: 6000 }
    ],
    양식: [
        { name: '토마토 파스타', price: 14000 },
        { name: '안심 스테이크', price: 32000 },
        { name: '리조또', price: 15000 },
        { name: '수프 & 샐러드', price: 9000 },
        { name: '하우스 와인 (글라스)', price: 8000 }
    ],
    디저트: [
        { name: '아메리카노', price: 4500 },
        { name: '수제 케이크', price: 7500 },
        { name: '크로플', price: 6500 },
        { name: '딸기라떼', price: 6000 },
        { name: '마카롱 세트', price: 8000 }
    ]
};
