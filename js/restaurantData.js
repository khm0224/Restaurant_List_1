// 핵심 역할: 식당 목록 데이터와 카테고리별 임시 메뉴 정보를 전역으로 제공
// 목적: 페이지 간 이동 시 선택된 식당 정보를 유지하고, 상세 페이지에서 식당명/주소/평점/메뉴를 표시함
// 특이점: 실제 DB 대신 자바스크립트 객체 배열을 사용하고, 교동 데이터만 채워진 상태

const districtNames = ['소양동', '교동', '조운동', '약사명동', '근화동', '후평1동', '후평2동', '후평3동', '효자1동', '효자2동', '효자3동', '석사동', '퇴계동', '강남동', '신사우동'];
const cuisineCategories = ['한식', '일식', '중식', '양식', '디저트'];

// 동네별 식당 정보를 구조화해서 전역 객체에 저장합니다.
window.restaurantData = Object.fromEntries(
    districtNames.map((district) => [
        district,
        Object.fromEntries(cuisineCategories.map((category) => [category, []]))
    ])
);


window.restaurantData.소양동 = {
    한식: [
        {
            name: '실비막국수', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220209_220%2F1644398122321dL8lK_JPEG%2F20211002_160455.jpg',
            address: '강원 춘천시 소양고개길 25 실비막국수', rating: 4.7, reviewCount: 3.717
        }, // Ok
        {
            name: '강릉집', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20171011_138%2F15076869596557I46h_JPEG%2FqAZlHEkafSdAEwME468UC6cL.jpg',
            address: '강원 춘천시 서부대성로 46 1층 강릉집', rating: 4.4, reviewCount: 2.478
        }, // OK
        {
            name: '한어울', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240507_135%2F1715044259152Njxqw_JPEG%2F4.jpg',
            address: '강원 춘천시 옥천길 35 한어울', rating: 4.7, reviewCount: 6.851
        },
        {
            name: '대영옥 돼지곰탕', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231022_84%2F1697956550145kLe32_JPEG%2FIMG_2333.jpeg',
            address: '강원 춘천시 낙원길 27 1층 대영옥돼지곰탕', rating: 4.0, reviewCount: 230
        }, // Ok
        {
            name: '백년족발요선점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250201_258%2F1738410514073kcOs4_JPEG%2F1738410477635.jpg',
            address: '강원 춘천시 서부대성로 22-1', rating: 4.1, reviewCount: 650
        } // Ok
    ],
    일식: [
        { name: '야키니쿠 찬', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251112_70%2F1762958775550GYMyg_JPEG%2FKakaoTalk_20251112_234601399.jpg', address: '강원 춘천시 낙원길 33 1층', rating: 4.3, reviewCount: 57 }, // Ok
        { name: '스시장', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20221111_265%2F1668168680049zYVeC_JPEG%2F20221108_072736.jpg', address: '강원 춘천시 가연길 11-1 스시장', rating: 4.2, reviewCount: 516 }, // Ok
        { name: '돈카돈까 춘천지하쇼핑몰점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250913_226%2F1757743699495zaKHX_PNG%2F%25BB%25F8%25B7%25AF%25B5%25E5_%25B5%25B7%25B1%25EE%25BD%25BA.png', 
            address: '강원 춘천시 중앙로 39-3 춘천지하쇼핑몰 다43~다46', rating: 4.1, reviewCount: 1.052
        }
    ],
    중식: [
        {
            name: '회영루', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250418_91%2F1744961801595inyiG_JPEG%2F%25A4%25BB%25A4%25BB%25A4%25BB.jpg', // OK
            address: '강원 춘천시 금강로 38', rating: 4.2, reviewCount: 4.240
        },
        {
            name: '려 블랙', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20221104_271%2F1667516749255U4G91_JPEG%2F%25C8%25AD%25BB%25EA.jpg',
            address: '강원 춘천시 서부대성로48번길 20 1층', rating: 4.3, reviewCount: 707
        },
        {
            name: '대원장중화요리', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240718_14%2F1721305535535qoyzU_JPEG%2F1000003807.jpg', // OK
            address: '강원 춘천시 중앙로134번길 24-1 1층 대원장', rating: 4.2, reviewCount: 307
        }
    ],
    양식: [
        { name: '레이아웃 춘천', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241012_262%2F1728725960465KwNQS_JPEG%2F9D9DE506-8CF6-49DF-83D2-BC0A89BBD8B5.jpeg', 
            address: '강원 춘천시 중앙로 140 A동 1층', rating: 4.3, reviewCount: 1.070 },
        { name: '히로', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250421_102%2F17452344741730sNtk_JPEG%2F1C448FD0-A18D-4EEA-ADDB-AACDD91C5911.jpeg', 
            address: '강원 춘천시 낙원길 47-2 1층', rating: 3.9, reviewCount: 174 },  // Ok
        { name: '콘스델리 춘천명동 본점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251113_257%2F1763000723640BMPuO_PNG%2F%25C1%25A6%25B8%25F1%25C0%25BB-%25C0%25D4%25B7%25C2%25C7%25D8%25C1%25D6%25BC%25BC%25BF%25E4_-016_-_2.png', 
            address: '강원 춘천시 옥천길 3 콘스델리 춘천시청점', rating: 4.8, reviewCount: 1.169 }
    ],
    디저트: [
        {
            name: '한입당', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260709_98%2F1783571657001V464i_JPEG%2FIMG_9990.jpg',  // Ok
            address: '강원 춘천시 가연길16번길 7 1층', rating: 4.0, reviewCount: 160
        },
        {
            name: '톰 커피바', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260424_205%2F1776959162499W5vCJ_JPEG%2Fp1.jpg',
            address: '강원 춘천시 소양고개길 50-7 1층', rating: 4.1, reviewCount: 2.676
        },
        {
            name: '푼히', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260710_2%2F1783615516010iFyUi_JPEG%2FIMG_0233.jpg',
            address: '강원 춘천시 소양고개길 20 1층 푼히', rating: 3.9, reviewCount: 460
        }
    ]
};



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

window.restaurantData.조운동 = {
    한식: [
        {
            name: '명동1번지닭갈비', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260421_32%2F1776745433270RFuCo_JPEG%2F1000009783.jpg',
            address: '강원 춘천시 금강로62번길 7', rating: 4.7, reviewCount: 3.940
        }, // Ok
        {
            name: '우미닭갈비 본점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20151105_177%2F1446690615750HH7VV_JPEG%2FSUBMIT_1446690321215_11589834.jpg',
            address: '강원 춘천시 금강로62번길 4', rating: 4.4, reviewCount: 4.667
        }, // OK
        {
            name: '춘천본가닭갈비', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20181230_239%2F15461439457137E7tJ_JPEG%2Fm04BcGH-q2chAq2pH3GfF96I.jpg',
            address: '강원 춘천시 금강로62번길 13', rating: 4.4, reviewCount: 1.821
        }
    ],
    일식: [
        { name: '카쿠레가 춘천점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231006_211%2F1696599985674o0iVH_PNG%2FKakaoTalk_20230622_122811762_17.png',
             address: '강원 춘천시 시청길10번길 4 1, 2층', rating: 4.8, reviewCount: 5.500 }, // Ok
        { name: '스시노칸도 춘천명동점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250429_227%2F1745909431105FsYwL_PNG%2FChatGPT_Image_2025%25B3%25E2_4%25BF%25F9_28%25C0%25CF_%25BF%25C0%25C8%25C4_02_18_38.png', 
            address: '강원 춘천시 금강로 68-12 6층', rating: 4.7, reviewCount: 3.400 }, // Ok
        { name: '닝교초식당 춘천조양점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20211228_47%2F16406689030950mCxM_JPEG%2Fcommon.jpeg', 
            address: '강원 춘천시 중앙로67번길 15 B1층', rating: 4.1, reviewCount: 1.211
        }
    ],
    중식: [
        {
            name: '대화관', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260530_70%2F17800902667787k72z_JPEG%2F1000001058.jpg', // OK
            address: '강원 춘천시 금강로62번길 15 2층 대화관', rating: 4.2, reviewCount: 506
        },
        {
            name: '니뽕내뽕 춘천명동점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241022_234%2F1729579564810f8bDe_JPEG%2FKakaoTalk_20240924_103350466.jpg',
            address: '강원 춘천시 중앙로67번길 18 브라운가', rating: 4.5, reviewCount: 1.401
        },
        {
            name: '샹츠마라', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fblogfiles.pstatic.net%2FMjAyNjA4MTJfMTcx%2FMDAxNzg2NTI2MTM0ODg2.XhoZTiYRB_oPwFydPKcYwaSo7nAy4LtBQaXjcyiZFQYg.SOGKhlTGSqFY44MFU5fvNKllNUnKm5vQ4_zv182h6Mog.JPEG%2F900_1786524149595.jpg%2F900x675', // OK
            address: '강원 춘천시 명동길 17-1', rating: 4.2, reviewCount: 117
        }
    ],
    양식: [
        { name: '빌리비 브런치카페', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240318_253%2F1710726993876DgaYB_JPEG%2FIMG_1440.jpeg', 
            address: '강원 춘천시 시청길10번길 11 1층', rating: 4.9, reviewCount: 465 },
        { name: '바른양식당', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20221021_133%2F1666352221183WJRQL_JPEG%2FA86569DE-305A-407F-B812-829EF7163CDA.jpeg', 
            address: '강원 춘천시 중앙로67번길 18 4동 2층 4205호', rating: 4.6, reviewCount: 3.330 },  // Ok
        { name: '미스터봉', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231018_229%2F1697593216604WkGTU_JPEG%2FKakaoTalk_20231018_103043752.jpg', 
            address: '강원 춘천시 명동길 3 2층', rating: 4.8, reviewCount: 69 }
    ],
    디저트: [
        {
            name: '모두막 춘천점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20171004_300%2F1507111082139kyGiR_JPEG%2FaJC6AaZC4kzB-yRHhiL9tuSH.jpg',  // Ok
            address: '강원 춘천시 금강로 68-4', rating: 4.0, reviewCount: 63
        },
        {
            name: '츄러스아저씨', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240613_218%2F17182767504136TXkA_PNG%2F1716461341352.png',
            address: '강원 춘천시 명동길 9 1층', rating: 4.1, reviewCount: 962
        },
        {
            name: '봄을담아 디저트카페', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260707_145%2F1783426877365kuVr6_JPEG%2F1780889886332%25281%2529_%25281%2529.jpg',
            address: '강원 춘천시 금강로62번길 14 봄을담아', rating: 4.5, reviewCount: 937
        }
    ]
};


window.restaurantData.약사명동 = {
    한식: [
        {
            name: '풍년소갈비살', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231209_96%2F1702096812572vpNng_JPEG%2FIMG_0297.jpeg',
            address: '강원 춘천시 중앙로107번길 15-6', rating: 4.2, reviewCount: 568
        }, // Ok
        {
            name: '남부막국수본관', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150925_157%2F1443161688671LaYB8_JPEG%2F166875554466908_0.jpg',
            address: '강원 춘천시 춘천로81번길 16', rating: 4.4, reviewCount: 963
        }, // OK
        {
            name: '와송칼국수', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20170414_9%2F1492149361842Pq3xY_JPEG%2F1.jpg',
            address: '강원 춘천시 명동길 46-1', rating: 4.4, reviewCount: 196
        }
    ],
    일식: [
        { name: '은은', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230119_9%2F1674100692545USlRa_JPEG%2F97F97A7C-0F56-48C6-B4A0-D71C677D9F50.jpeg',
             address: '강원 춘천시 망대길37번길 19', rating: 4.8, reviewCount: 435 }, // Ok
        { name: '수제돈까스', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20180610_148%2F1528613403580pDV9p_JPEG%2F8T0rxrULPUhIZbKlqljyfpXP.jpg', 
            address: '강원 춘천시 명동길 43', rating: 4.7, reviewCount: 322 }
    ],
    중식: [
        {
            name: '보문각', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190110_21%2F15471131309374jNFa_JPEG%2FZ3AGKKmXNfFWntwz7EeGPb6x.jpg', // OK
            address: '강원 춘천시 약사고개길 42', rating: 4.3, reviewCount: 2.230
        }
    ],
    양식: [
        { name: '함지레스토랑', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190107_131%2F1546840851597EpzRs_JPEG%2FDiYsr2pD5121OlGxTX6QaFLU.jpg', 
            address: '강원 춘천시 중앙로 101', rating: 4.3, reviewCount: 1.120 },
        { name: '뽁밥 춘천본점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240503_227%2F17146990046716euga_JPEG%2FIMG_2862.jpeg', 
            address: '강원 춘천시 중앙로 125 1층 뽁밥', rating: 4.6, reviewCount: 350 }
    ],
    디저트: [
        {
            name: '모민', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260812_258%2F1786511373646VkjOp_JPEG%2FIMG_0121.jpg',  // Ok
            address: '강원 춘천시 망대길 13 momin', rating: 4, reviewCount: 410
        },
        {
            name: '풍경1961', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250321_289%2F1742547501083r6T8V_JPEG%2F1000051489.jpg',
            address: '강원 춘천시 방송길7번길 10 1층', rating: 4.1, reviewCount: 29
        },
        {
            name: '훗', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260814_160%2F1786658383546hXOSl_JPEG%2FIMG_3536.jpg',
            address: '강원 춘천시 명동길 51-1 1층 Hoot', rating: 4.5, reviewCount: 93
        }
    ]
};


window.restaurantData.근화동 = {
    한식: [
        {
            name: '호수별닭갈비', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251223_114%2F1766461294172mIeh9_JPEG%2FKakaoTalk_20251223_124107346_01.jpg',
            address: '강원 춘천시 영서로 2529-45 호수별닭갈비', rating: 4.2, reviewCount: 4.067
        }, // Ok
        {
            name: '메바우명가춘천막국수', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150925_157%2F1443161688671LaYB8_JPEG%2F166875554466908_0.jpg',
            address: '강원 춘천시 당간지주길 76 1층', rating: 4.7, reviewCount: 9.633
        }, // OK
        {
            name: '남촌막국수', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190120_68%2F1547978279081oAHLt_JPEG%2F-6pHWNMLhbEXL8GcrE-E8iiK.jpg',
            address: '강원 춘천시 당간지주길 71', rating: 4.4, reviewCount: 2.176
        }
    ],
    일식: [
        { name: '가거도횟집', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyMzAyMjdfMjQ2%2FMDAxNjc3NDg4NDQ0MzU5.tAPzsXtflVhJyLbzref-CQDHC71jYI5DeYctw_HCMswg.pRj0pyN1ZM2ddDeBjhVygQbIi6o7rvSeepz9_iwi8-Yg.JPEG%2F01A70363-7099-4157-AD41-470BF3769BED.jpeg',
             address: '강원 춘천시 망대길37번길 19', rating: 4.2, reviewCount: 3 }
    ],
    중식: [
        {
            name: '이비가짬뽕 춘천점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260709_218%2F17835830129735Qx6p_JPEG%2Fimage4.jpg', // OK
            address: '강원 춘천시 영서로 2652 2층 이비가짬뽕 춘천점', rating: 4.3, reviewCount: 2.184
        },
        {
            name: '호반중식부페', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240223_138%2F17086690600066RH1o_JPEG%2F1708669024360.jpg', // OK
            address: '강원 춘천시 공지로 603-8', rating: 4.3, reviewCount: 180
        }
    ],
    양식: [
        { name: '라토피아', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251211_22%2F1765429067660RADC7_JPEG%2F001.jpg', 
            address: '강원 춘천시 영서로 2571 라토피아', rating: 4.3, reviewCount: 180 },
        { name: '샌드소양', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNTEwMDFfMTQy%2FMDAxNzU5MjgyODkwMTQ5.wjTKRJkQkvwNtwBdB5Q7qov3BeI_ccQpYtsLnwpAXBAg.anVl13oi_Tq-8yesmngl4liHLWhvB_hT8ya6VygpYGIg.JPEG%2F1000052284.jpg.jpg', 
            address: '강원 춘천시 번개시장길 32 110호', rating: 4.6, reviewCount: 82 }
    ],
    디저트: [
        {
            name: '리버레인', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241204_209%2F1733284824446GTVvr_JPEG%2FKakaoTalk_20241204_125950077_02.jpg',  // Ok
            address: '강원 춘천시 영서로 2529-47', rating: 4, reviewCount: 14.010
        },
        {
            name: '맘인더가든', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241225_118%2F1735127462135Miu23_JPEG%2FIMG_1762.jpg',
            address: '강원 춘천시 영서로 2668-22 2층', rating: 4.1, reviewCount: 1.443
        },
        {
            name: '아주르봄', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250608_100%2F1749386842290dM3Jg_PNG%2F%25BE%25C6%25C1%25D6%25B8%25A3%25BA%25BD_%25B7%25CE%25B0%25ED.png',
            address: '강원 춘천시 영서로 2529-38 아주르봄', rating: 4.5, reviewCount: 1.341
        }
    ]
};


window.restaurantData.후평1동 = {
    한식: [
        {
            name: '큰길낙지볶음', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220929_59%2F1664437282097smQUj_JPEG%2F20220929_135753.jpg',
            address: '강원 춘천시 후석로420번길 7 하이테크 2층 A201호', rating: 4.4, reviewCount: 645
        }, // Ok
        {
            name: '땡구땡구 본점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220307_73%2F1646654269388I0R6e_JPEG%2F20220224_173622.jpg',
            address: '강원 춘천시 후석로 435 (1동)', rating: 4.7, reviewCount: 669
        }, // OK
        {
            name: '보영이네 해물칼국수 본점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260610_14%2F1781077588993aYfXc_JPEG%2FIMG_0672.jpg',
            address: '강원 춘천시 공단로60번길 2 보영이네 해물칼국수본점', rating: 4.6, reviewCount: 1.676
        }
    ],
    일식: [
        { name: '해마', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20170222_217%2F1487730333526f7bq8_JPEG%2F0222_.jpg',
             address: '강원 춘천시 춘천로 380-1', rating: 4.2, reviewCount: 706 }
    ],
    중식: [
        {
            name: '뽕뽕황짬뽕이야', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190120_100%2F1547969808350vUaN5_JPEG%2FC-5PHA0gJzDnyuUkG2Ep5NH8.jpg', // OK
            address: '강원 춘천시 후석로455번길 53-1', rating: 4.3, reviewCount: 569
        },
        {
            name: '한중관', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250425_298%2F1745561589908WcLrm_JPEG%2F1745561558547.jpg', // OK
            address: '강원 춘천시 삭주로 134-1 1층', rating: 4.3, reviewCount: 14
        },
         {
            name: '웍선생', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260109_290%2F1767958695614F3FdU_JPEG%2FIMG_9489.jpeg', // OK
            address: '강원 춘천시 후석로462번길 96 1, 2층', rating: 4.3, reviewCount: 36
        }
    ],
    디저트: [
        {
            name: '텐퍼센트커피 춘천하이테크점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20240608_293%2F1717831697859fiUvA_JPEG%2F%25B0%25A1%25B0%25D4%25BB%25E7%25C1%25F8.jpg',  // Ok
            address: '강원 춘천시 후석로420번길 7 하이테크타워 1층 A110호', rating: 4, reviewCount: 322
        },
        {
            name: '카페400', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240514_230%2F1715667948669GV4c0_JPEG%2F1000033834.jpg',
            address: '강원 춘천시 후석로 400 GS칼텍스주유소건물 1층', rating: 4.1, reviewCount: 176
        },
        {
            name: '그레이빌', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20210503_265%2F1619979934230UVsNm_JPEG%2FNV8AFc1Fa6tAlPbs9_sOiHs1.jpg',
            address: '강원 춘천시 후석로440번길 63', rating: 4.5, reviewCount: 294
        }
    ]
};


window.restaurantData.후평2동 = {
    한식: [
        {
            name: '홍가네 소머리국밥&순대국밥', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220811_52%2F16602177918631OuxT_JPEG%2F20220810_122235.jpg',
            address: '강원 춘천시 춘천로310번길 39 1층 홍가네소머리국밥', rating: 4.4, reviewCount: 156
        }, // Ok
        {
            name: '화포식당춘천점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20210209_140%2F1612870971270unSYv_JPEG%2Fx1ETX9vKIWhbuj5ndh-csmK1.jpeg.jpg',
            address: '강원 춘천시 춘천로 306-5 1층', rating: 4.6, reviewCount: 552
        }, // OK
        {
            name: '서윤식당', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231104_211%2F1699078660310umvJy_JPEG%2FIMG_8311.jpeg',
            address: '강원 춘천시 춘천로 271 1층', rating: 3.8, reviewCount: 713
        }
    ],
    일식: [
        { name: '춘천돈가스', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20221121_227%2F1669030982853lHuXA_JPEG%2FKakaoTalk_20220330_125631695.jpg', 
            address: '강원 춘천시 춘천로 306-5 1층', rating: 4.3, reviewCount: 700 }, // Ok
        { name: '은희네웰빙튀김집', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20170822_128%2F1503393546457Rqq7t_JPEG%2FbMzcCf_FPenAH8Unygnrb3k9.jpg', 
            address: '강원 춘천시 춘천로296번길 13', rating: 4.7, reviewCount: 55 }
    ],
    중식: [
        {
            name: '후평각', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190101_57%2F1546344593708pjf6F_JPEG%2FgXEkqyc4A4_orvfh87EsYi24.jpg', // OK
            address: '강원 춘천시 춘천로 292', rating: 4.2, reviewCount: 66
        },
        {
            name: '대양부양꼬치 춘천점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20191231_96%2F1577766588632y4ofa_JPEG%2F599psxPtjWVSdC1XedcUHe3M.jpg',
            address: '강원 춘천시 백령로 217-20', rating: 4.3, reviewCount: 361
        },
        {
            name: '동춘관', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190110_22%2F1547101109535xSbwQ_JPEG%2FSmUWYbmTM7QzqVstvO0eH9oj.jpg', // OK
            address: '강원 춘천시 춘천로282번길 4', rating: 4.4, reviewCount: 39
        }
    ],
    양식: [
        { name: '청년피자 춘천후평점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250522_295%2F1747900282237yJvUX_JPEG%2F25.05_%25C3%25BB%25B3%25E2%25C7%25C7%25C0%25DA_%25B3%25D7%25C0%25CC%25B9%25F6_%25BD%25BA%25B8%25B6%25C6%25AE%25C7%25C3%25B7%25B9%25C0%25CC%25BD%25BA_%25BD%25E6%25B3%25D7%25C0%25CF%2528%25B7%25CE%25B0%25ED%25BA%25AF%25B0%25E6%2529.jpg', 
            address: '강원 춘천시 춘천로282번길 1 1층(후평동)', rating: 4.5, reviewCount: 35 }
    ],
    디저트: [
        {
            name: '아글라오네마', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNjA3MjVfMTAw%2FMDAxNzg0OTcwMTczMzI1.V635KmacW_Mb71SJXA9FCMyxHNJX683BvOc7atkaj2wg.Dzgqey88rlys3FFakpeqhaM3l3z4J9lAwt1QCrc423og.JPEG%2FIMG_7751.jpeg',  // Ok
            address: '강원 춘천시 춘천로282번길 15', rating: 4.0, reviewCount: 352
        },
        {
            name: '데이븐', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260425_29%2F1777101480160mzioj_JPEG%2FKakaoTalk_20260425_161351329_07.jpg',
            address: '강원 춘천시 춘천로296번길 20 1층', rating: 4.1, reviewCount: 29
        },
        {
            name: '어나더패브릭', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260707_196%2F17833998114412vpco_JPEG%2FIMG_0146.jpg',
            address: '강원 춘천시 백령로 217-10', rating: 3.9, reviewCount: 667
        }
    ]
};



window.restaurantData.후평3동 = {
    한식: [
        {
            name: '1.5닭갈비 본점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250414_183%2F1744604972798mMSyl_JPEG%2F1000014359.jpg',
            address: '강원 춘천시 후만로 77 1.5닭갈비', rating: 4.4, reviewCount: 1.235
        }, // Ok
        {
            name: '4단지닭갈비', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240617_260%2F1718591884132epoet_JPEG%2F%25BF%25DC%25B0%25FC.jpg',
            address: '강원 춘천시 후만로 81', rating: 4.6, reviewCount: 601
        }, // OK
        {
            name: '이모네 불막창', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220308_188%2F16467300363557bttJ_JPEG%2F201DE9F6-908C-4E80-8B4C-A9E41F035620.jpeg',
            address: '강원 춘천시 보안길 50-1 맛깔탕', rating: 3.8, reviewCount: 713
        }
    ],
    일식: [
        { name: '샤브르정원 춘천점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251112_229%2F1762929347766guiAr_JPEG%2F1.jpg', 
            address: '강원 춘천시 삭주로 69', rating: 4.3, reviewCount: 164 }, // Ok
        { name: '엠브로돈까스 춘천후평점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250315_243%2F1742030702353ijw0n_JPEG%2F1742030596575-3.jpg', 
            address: '강원 춘천시 보안길 51 1층', rating: 4.7, reviewCount: 679 }, // Ok
        { name: '사이타마', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251125_141%2F1764045541374voY8i_JPEG%2F1764018140586.jpg', 
            address: '강원 춘천시 후석로326번길 11 1층', rating: 4.6, reviewCount: 21 }
    ],
    중식: [
        {
            name: '돌담집짬뽕', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190115_265%2F1547541363997uhy8a_JPEG%2Fi9LxZaxR987gr8wu-CsJPwiB.jpg', // OK
            address: '강원 춘천시 보안길 50-2', rating: 4.2, reviewCount: 358
        },
        {
            name: '태양부 양꼬치 후평점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240528_197%2F1716863054677ae8sR_JPEG%2F123.jpg',
            address: '강원 춘천시 후석로 318', rating: 4.3, reviewCount: 361
        },
        {
            name: '초원가', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220612_142%2F1654999648775hLT6w_JPEG%2F1.jpg', // OK
            address: '강원 춘천시 보안길 71 2층', rating: 4.4, reviewCount: 328
        }
    ],
    양식: [
         {
            name: '올블루파스타', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260313_99%2F1773395730538WxjuR_JPEG%2F1000013506.jpg',  // Ok
            address: '강원 춘천시 후만로 91 1층', rating: 4.0, reviewCount: 2.456
        },
        { name: '맥도날드 춘천후평DT점', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20180528_263%2F1527496417464qoK2q_JPEG%2FXU7BwturWDgAdCKuomXr1lyR.jpg', 
            address: '강원 춘천시 후석로 334', rating: 4.2, reviewCount: 10.000 },  // Ok
        ],
    디저트: [
        {
            name: '미미즈', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251003_68%2F1759420575451djuVF_JPEG%2F1000122103.jpg',  // Ok
            address: '강원 춘천시 보안길 42 1층', rating: 4.0, reviewCount: 39
        },
        {
            name: '춘젤라또', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250611_290%2F1749624382039vM5Tn_JPEG%2FA6967ACC-8D22-47C8-93A5-C48CA128A306.jpeg',
            address: '강원 춘천시 후석로 304 부속건물 1층 106호', rating: 4.1, reviewCount: 333
        },
        {
            name: '도깨비꽈배기', img: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fblogfiles.pstatic.net%2FMjAyNjA1MTVfNjYg%2FMDAxNzc4ODQ0MDMyNjkz.iyeC3pQ1vOdtrm9T5pwrbEe7me6eF84cVoy1_q2MuVog.zJUwCqsfvBBfVCPzOYMx3c8M8cp9Wy8_3vw9BjXuFmIg.JPEG%2F20260514%25EF%25BC%25BF191620.jpg%2F3000x4000',
            address: '강원 춘천시 보안길 39 1층', rating: 4.4, reviewCount: 229
        }
    ]
};



window.currentSelectedDistrict = '교동';

// 카테고리와 인덱스를 받아 특정 식당 정보를 조회합니다.
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

// 선택한 식당 정보를 세션 스토리지에 저장해서 상세 페이지에서 복원할 수 있게 합니다.
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

// 카테고리별 임시 메뉴 데이터입니다. 식당마다 메뉴가 따로 없어서 카테고리 기준으로 대체합니다.
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
