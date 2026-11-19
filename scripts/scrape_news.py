"""
DDahyuk (따혁 / 안민혁) 뉴스 자동 수집 스크립트
- 네이버 뉴스 검색 결과에서 '따혁', 'DDahyuk' 키워드 기사를 긁어와
  news_data.js 파일로 자동 업데이트하는 GitHub Actions용 스크립트입니다.
- 실행 주기: 매일 오전 9시 (KST) — GitHub Actions cron으로 트리거
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import os
from datetime import datetime, timezone, timedelta
from urllib.parse import quote

KEYWORDS = ["따혁", "DDahyuk"]
SEARCH_SOURCES = []
KST = timezone(timedelta(hours=9))

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def fetch_naver_news(keyword: str, display: int = 20) -> list[dict]:
    """
    네이버 뉴스 검색 결과 페이지를 파싱하여 기사 목록을 반환합니다.
    네이버 뉴스 검색 URL: https://search.naver.com/search.naver?where=news&query=...
    """
    url = f"https://search.naver.com/search.naver?where=news&query={quote(keyword)}&sort=1&ds=&de=&start=1"
    articles = []

    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # 네이버 뉴스 검색 결과 블록 (.news_wrap, .news_area)
        news_items = soup.select("div.news_wrap.api_ani_send")
        if not news_items:
            news_items = soup.select("ul.list_news > li")

        for item in news_items[:display]:
            try:
                # 제목
                title_tag = item.select_one("a.news_tit") or item.select_one("a.title")
                if not title_tag:
                    continue
                title = title_tag.get_text(strip=True)
                link = title_tag.get("href", "")

                # 키워드 포함 여부 확인
                title_lower = title.lower()
                if "따혁" not in title_lower and "ddahyuk" not in title_lower and "안민혁" not in title_lower:
                    # 본문 요약에서도 검색
                    summary_tag = item.select_one("div.dsc_wrap") or item.select_one("div.news_dsc")
                    summary_text = summary_tag.get_text(strip=True) if summary_tag else ""
                    summary_lower = summary_text.lower()
                    if "따혁" not in summary_lower and "ddahyuk" not in summary_lower and "안민혁" not in summary_lower:
                        continue

                # 언론사 이름
                press_tag = (
                    item.select_one("a.info.press")
                    or item.select_one("span.press_name")
                    or item.select_one("span.info")
                )
                press = press_tag.get_text(strip=True) if press_tag else "알 수 없음"
                press = re.sub(r"\s*언론사\s*선정.*", "", press).strip()

                # 본문 요약
                summary_tag = item.select_one("div.dsc_wrap") or item.select_one("div.news_dsc")
                summary = summary_tag.get_text(strip=True) if summary_tag else ""

                # 썸네일 이미지
                img_tag = item.select_one("img.thumb") or item.select_one("img")
                thumbnail = ""
                if img_tag:
                    thumbnail = img_tag.get("src") or img_tag.get("data-lazy-src", "")
                    if thumbnail and thumbnail.startswith("//"):
                        thumbnail = "https:" + thumbnail
                    # 작은 아이콘 이미지 필터링
                    if thumbnail and ("favicon" in thumbnail or thumbnail.endswith(".ico")):
                        thumbnail = ""

                # 날짜 (상대날짜 -> 절대날짜 변환)
                date_tag = item.select_one("span.info")
                date_str = ""
                if date_tag:
                    date_text = date_tag.get_text(strip=True)
                    date_str = parse_naver_date(date_text)

                articles.append({
                    "title": title,
                    "link": link,
                    "press": press,
                    "summary": summary,
                    "thumbnail": thumbnail,
                    "date": date_str or datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
                })

            except Exception as e:
                print(f"  [WARN] 기사 파싱 실패: {e}")
                continue

    except Exception as e:
        print(f"  [ERROR] 네이버 뉴스 요청 실패 ({keyword}): {e}")

    return articles


def parse_naver_date(date_text: str) -> str:
    """
    네이버 뉴스 날짜 텍스트를 'YYYY-MM-DD HH:mm:ss' 포맷으로 변환합니다.
    예: '2024.08.15.' → '2024-08-15 00:00:00'
        '1시간 전'    → 현재 시각 기반으로 계산
    """
    now = datetime.now(KST)
    date_text = date_text.strip()

    # 'X분 전' / 'X시간 전'
    if "분 전" in date_text:
        m = re.search(r"(\d+)분", date_text)
        if m:
            dt = now - timedelta(minutes=int(m.group(1)))
            return dt.strftime("%Y-%m-%d %H:%M:%S")
    if "시간 전" in date_text:
        m = re.search(r"(\d+)시간", date_text)
        if m:
            dt = now - timedelta(hours=int(m.group(1)))
            return dt.strftime("%Y-%m-%d %H:%M:%S")
    if "일 전" in date_text:
        m = re.search(r"(\d+)일", date_text)
        if m:
            dt = now - timedelta(days=int(m.group(1)))
            return dt.strftime("%Y-%m-%d %H:%M:%S")

    # '2024.08.15.' 형식
    m = re.search(r"(\d{4})\.(\d{1,2})\.(\d{1,2})", date_text)
    if m:
        return f"{m.group(1)}-{m.group(2).zfill(2)}-{m.group(3).zfill(2)} 00:00:00"

    return now.strftime("%Y-%m-%d %H:%M:%S")


def deduplicate(articles: list[dict]) -> list[dict]:
    """제목 기준 중복 기사 제거"""
    seen_titles = set()
    unique = []
    for art in articles:
        normalized = re.sub(r"[\s\[\]\"'']", "", art["title"]).lower()
        if normalized not in seen_titles:
            seen_titles.add(normalized)
            unique.append(art)
    return unique


def sort_by_date(articles: list[dict]) -> list[dict]:
    """최신순 정렬"""
    def date_key(a):
        try:
            return datetime.strptime(a["date"], "%Y-%m-%d %H:%M:%S")
        except Exception:
            return datetime.min
    return sorted(articles, key=date_key, reverse=True)


def to_js_string(articles: list[dict]) -> str:
    """기사 목록을 news_data.js 형식으로 변환합니다."""
    now_kst = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
    entries = []

    for idx, art in enumerate(articles, start=1):
        display_date = art["date"][:10].replace("-", ".")

        # summary: 150자로 자르고 말줄임표 추가
        summary = art.get("summary", "").strip()
        if len(summary) > 150:
            summary = summary[:150] + "..."

        thumbnail_js = f'"{art["thumbnail"]}"' if art.get("thumbnail") else '""'

        # 실제 기사 링크 (상세 페이지에서 원문 보기 버튼용)
        link = art.get("link", "")

        entry = f"""  {{
    id: {idx},
    press: {json.dumps(art["press"], ensure_ascii=False)},
    title: {json.dumps(art["title"], ensure_ascii=False)},
    date: {json.dumps(art["date"], ensure_ascii=False)},
    displayDate: {json.dumps(display_date, ensure_ascii=False)},
    summary: {json.dumps(summary, ensure_ascii=False)},
    thumbnail: {thumbnail_js},
    link: {json.dumps(link, ensure_ascii=False)},
    content: `<p>${{json.dumps(summary, ensure_ascii=False).strip('"')}}...</p><p><a href="${{link}}" target="_blank" rel="noopener noreferrer" style="color: #00e5ff;">▶ 원문 기사 보러가기</a></p>`
  }}"""
        entries.append(entry)

    js = f"""// DDahyuk (안민혁 / 따혁) 뉴스 자동 수집 데이터
// 마지막 업데이트: {now_kst} (KST)
// GitHub Actions에 의해 매일 오전 9시(KST) 자동으로 갱신됩니다.
// 키워드: 따혁, DDahyuk, 안민혁
const newsDatabase = [
{",\n".join(entries)}
];
"""
    return js


def main():
    print("=" * 60)
    print(f"[DDahyuk 뉴스 수집 시작] {datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S')} KST")
    print("=" * 60)

    all_articles = []

    for keyword in KEYWORDS:
        print(f"\n📌 키워드 검색: '{keyword}'")
        articles = fetch_naver_news(keyword, display=20)
        print(f"   → {len(articles)}건 수집")
        all_articles.extend(articles)

    # 중복 제거 및 최신순 정렬
    all_articles = deduplicate(all_articles)
    all_articles = sort_by_date(all_articles)

    print(f"\n✅ 중복 제거 후 최종 기사 수: {len(all_articles)}건")

    # news_data.js 파일 경로 (스크립트 기준 상위 디렉터리)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "..", "news_data.js")
    output_path = os.path.normpath(output_path)

    if all_articles:
        js_content = to_js_string(all_articles)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(js_content)
        print(f"\n💾 news_data.js 저장 완료: {output_path}")
        print(f"   총 {len(all_articles)}건 기사 반영됨")
    else:
        print("\n⚠️  수집된 기사가 없어 news_data.js를 업데이트하지 않습니다.")

    print("\n" + "=" * 60)
    print("[수집 완료]")
    print("=" * 60)


if __name__ == "__main__":
    main()
