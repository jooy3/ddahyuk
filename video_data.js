// DDahyuk 영상 데이터베이스
// 탭 카테고리: ALL / MATCH / RANK / INTERVIEW / CLIP
const videoDatabase = [
  {
    id: 1,
    category: "MATCH",
    title: "[LCK CL] HANJIN BRION vs OK저축은행 브리온 — DDahyuk 피오라 MVP",
    date: "2024-05-18 19:30:00",
    displayDate: "2024.05.18",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "2024 LCK CL 스프링 정규 시즌 경기. DDahyuk이 피오라를 앞세워 솔로킬 2개를 포함한 압도적인 탑 캐리로 팀을 승리로 이끌었다."
  },
  {
    id: 2,
    category: "MATCH",
    title: "[LCK CL] 리브 샌드박스 유스 vs OK브리온 — 따혁 역전패에도 빛난 개인 기량",
    date: "2023-07-24 20:05:00",
    displayDate: "2023.07.24",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "팀은 1:2로 패했지만, 따혁의 피오라 플레이는 이날 LCK CL 최고 명장면으로 손꼽혔다."
  },
  {
    id: 3,
    category: "RANK",
    title: "2,371 LP 도달 순간 | DDahyuk KR 솔로랭크 1위 달성 하이라이트",
    date: "2024-08-15 17:40:00",
    displayDate: "2024.08.15",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "챌린저 2,371 LP 달성 순간의 솔로랭크 클립. 피오라로 1:2 상황에서 역전 솔로킬을 뽑아내며 역대급 순위를 기록했다."
  },
  {
    id: 4,
    category: "RANK",
    title: "DDahyuk 탑 베인 솔로랭크 — 챌린저 고점 운영 풀영상",
    date: "2024-07-02 21:15:00",
    displayDate: "2024.07.02",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "탑 베인으로 스플릿 푸시를 완벽하게 활용하는 DDahyuk의 솔로랭크 풀영상. 사이드 운영의 정석을 보여준다."
  },
  {
    id: 5,
    category: "INTERVIEW",
    title: "[LCK CL 인터뷰] DDahyuk — \"피오라는 제 모든 것, 항상 1위를 목표로\"",
    date: "2024-05-20 18:00:00",
    displayDate: "2024.05.20",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "LCK CL 경기 후 진행된 공식 인터뷰. DDahyuk이 솔로랭크 목표와 팀 케미스트리에 대해 솔직하게 이야기했다."
  },
  {
    id: 6,
    category: "INTERVIEW",
    title: "[롤 더 넥스트 2021] 따혁 안민혁 — 결승 진출 소감 인터뷰",
    date: "2021-12-15 19:10:00",
    displayDate: "2021.12.15",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "대국민 오디션 롤 더 넥스트 2021 결승 진출 직후의 인터뷰. 프로 무대를 향한 당찬 각오를 밝혔다."
  },
  {
    id: 7,
    category: "CLIP",
    title: "따혁 피오라 1vs3 클러치 — 챌린저 고점 순간 모음",
    date: "2024-09-10 22:50:00",
    displayDate: "2024.09.10",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "챌린저 솔로랭크 1vs3 역전 클러치 클립. 피오라의 응수 판단력이 정점에 달한 순간들을 편집했다."
  },
  {
    id: 8,
    category: "CLIP",
    title: "DDahyuk BEST PLAY 2024 — 연간 하이라이트 클립",
    date: "2024-12-01 16:20:00",
    displayDate: "2024.12.01",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "2024년 한 해 동안 LCK CL 무대와 솔로랭크에서 보여준 최고의 플레이를 모은 연간 하이라이트 영상이다."
  }
];
