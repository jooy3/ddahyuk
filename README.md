# DDahyuk Portfolio

리그 오브 레전드 프로게이머 DDahyuk (안민혁)의 공식 포트폴리오 웹사이트입니다.

## 🗞️ 뉴스 자동 수집 (GitHub Actions)

이 저장소는 **매일 오전 9시 (KST)** 에 GitHub Actions가 자동으로 실행되어,  
네이버 뉴스에서 **'따혁'**, **'DDahyuk'** 키워드가 포함된 기사를 수집하고  
`news_data.js`를 최신 상태로 자동 갱신합니다.

### 수동 실행 방법

1. GitHub 저장소 페이지 → **Actions** 탭으로 이동  
2. `🗞️ DDahyuk 뉴스 자동 수집` 워크플로 클릭  
3. **Run workflow** 버튼 클릭 → 즉시 실행

## 📁 프로젝트 구조

```
ddahyuk/
├── index.html              # 메인 HTML
├── style.css               # 전체 스타일
├── script.js               # SPA 라우팅 및 뉴스 로직
├── news_data.js            # 🤖 자동 수집된 뉴스 데이터 (GitHub Actions 갱신)
├── profile_placeholder.svg # 기본 프로필 이미지
├── scripts/
│   ├── scrape_news.py      # 뉴스 수집 Python 스크립트
│   └── requirements.txt    # Python 의존성
└── .github/
    └── workflows/
        └── scrape_news.yml # GitHub Actions 워크플로 정의
```

## 🌐 GitHub Pages 배포

이 사이트는 **GitHub Pages**를 통해 무료로 배포할 수 있습니다.

1. 저장소 → **Settings** → **Pages**  
2. Source: `Deploy from a branch`  
3. Branch: `main` / `/ (root)` 선택 후 **Save**  
4. 잠시 후 `https://<username>.github.io/<repository>/` 에서 접근 가능
