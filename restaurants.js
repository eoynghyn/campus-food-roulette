// 세종캠퍼스 주변 식당 목록
// (예시)로 시작하는 항목은 직접 조사한 실제 식당 정보로 바꿔 주세요.
//
// name      식당 이름
// category  음식 종류 (한식, 중식, 일식, 분식, 양식, 카페 등)
// price     대표 메뉴 1인 가격 (원)
// walk      학교 정문에서 걸어서 걸리는 시간 (분)
// maxGroup  한 번에 같이 앉을 수 있는 최대 인원
// moods     "spicy"(매운) "quick"(빠른) "hearty"(든든한) "light"(가벼운) 중 해당하는 것
// mapUrl    네이버/카카오 지도 링크 (모르면 "")
const RESTAURANTS = [
  { name: "(예시) 김치찌개집", category: "한식", price: 8000, walk: 5, maxGroup: 6, moods: ["spicy", "hearty"], mapUrl: "" },
  { name: "(예시) 분식집", category: "분식", price: 5000, walk: 3, maxGroup: 4, moods: ["quick", "spicy"], mapUrl: "" },
  { name: "(예시) 돈까스집", category: "일식", price: 9500, walk: 7, maxGroup: 4, moods: ["hearty"], mapUrl: "" },
  { name: "(예시) 샐러드 카페", category: "카페", price: 11000, walk: 10, maxGroup: 2, moods: ["light"], mapUrl: "" },
  { name: "(예시) 중국집", category: "중식", price: 7000, walk: 6, maxGroup: 8, moods: ["quick", "hearty"], mapUrl: "" },
  { name: "(예시) 마라탕집", category: "중식", price: 12000, walk: 12, maxGroup: 4, moods: ["spicy"], mapUrl: "" },
];
