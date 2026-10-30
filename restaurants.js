// 세종캠퍼스 주변 식당 목록 (직접 조사)
//
// name      식당 이름
// category  음식 종류 (한식, 중식, 일식, 분식, 양식 등)
// price     대표 메뉴 1인 가격 (원)
// walk      학교 정문에서 걸어서 걸리는 시간 (분)
// moods     "spicy"(매운) "quick"(빠른) "hearty"(든든한) "babyak"(밥약) 중 해당하는 것
// mapUrl    네이버/카카오 지도 링크 (모르면 "")
const RESTAURANTS = [
  { name: "필라프에빠지다", category: "양식", price: 12000, walk: 5, moods: ["quick", "hearty"], mapUrl: "" },
  { name: "폴바나", category: "양식", price: 10000, walk: 2, moods: ["quick", "babyak"], mapUrl: "" },
  { name: "애상금탕", category: "중식", price: 9000, walk: 2, moods: ["spicy", "hearty"], mapUrl: "" },
  { name: "진미방마라탕", category: "중식", price: 9000, walk: 2, moods: ["spicy", "hearty"], mapUrl: "" },
  { name: "맛나분식", category: "한식·분식", price: 10000, walk: 3, moods: ["quick", "hearty"], mapUrl: "" },
  { name: "파랑새분식", category: "분식", price: 7000, walk: 2, moods: ["quick"], mapUrl: "" },
  { name: "한솥도시락", category: "한식", price: 7000, walk: 1, moods: ["quick"], mapUrl: "" },
  { name: "원미닭갈비", category: "한식", price: 10000, walk: 3, moods: ["spicy", "hearty"], mapUrl: "" },
  { name: "더라멘", category: "일식", price: 10000, walk: 3, moods: ["babyak", "quick"], mapUrl: "" },
  { name: "초밥발전소", category: "일식", price: 13000, walk: 6, moods: ["babyak"], mapUrl: "" },
  { name: "서창해물칼국수", category: "한식", price: 9000, walk: 8, moods: ["hearty"], mapUrl: "" },
  { name: "남해멸치국수", category: "한식", price: 8000, walk: 4, moods: ["quick", "hearty"], mapUrl: "" },
  { name: "안쉐프", category: "중식", price: 13000, walk: 15, moods: ["hearty"], mapUrl: "" },
  { name: "이모네수육국밥", category: "한식", price: 9000, walk: 8, moods: ["hearty"], mapUrl: "" },
  { name: "조치원짬뽕", category: "중식", price: 10000, walk: 15, moods: ["quick", "spicy"], mapUrl: "" },
];
