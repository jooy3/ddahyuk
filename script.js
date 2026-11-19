document.addEventListener('DOMContentLoaded', () => {
  const homeLogo = document.getElementById('homeLogo');
  const gnbLinks = document.querySelectorAll('.gnb-link');
  const pageViews = document.querySelectorAll('.page-view');

  // ==========================================
  // [0] STATISTICS 메뉴 로직 (Season 다중/ALL 필터 + Tournament 단일 필터 + gol.gg 데이터)
  // ==========================================
  const seasonFilterGroup = document.getElementById('seasonFilterGroup');
  const tournamentFilterSelect = document.getElementById('tournamentFilterSelect');
  const statsOverviewGrid = document.getElementById('statsOverviewGrid');
  const championStatsTbody = document.getElementById('championStatsTbody');
  const activeFilterBadge = document.getElementById('activeFilterBadge');

  // 필터 상태:
  // selectedSeasons: ['ALL'] 또는 ['2023'], ['2023', '2025'] 등 다중 선택
  let selectedSeasons = ['ALL'];
  // selectedTournament: 'ALL' 또는 'LCK CL 2026 Rounds 3-4' 등 단일 선택
  let selectedTournament = 'ALL';

  function initStatistics() {
    if (!seasonFilterGroup || !tournamentFilterSelect || typeof golStatsDatabase === 'undefined') return;

    // 1. Season 버튼 클릭 이벤트
    const seasonBtns = seasonFilterGroup.querySelectorAll('.season-filter-btn');
    seasonBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const season = btn.getAttribute('data-season');

        if (season === 'ALL') {
          // ALL을 선택할 때에는 다른 선택항목들이 선택 해제됨
          selectedSeasons = ['ALL'];
        } else {
          // 특정 시즌(2023, 2025, 2026)을 선택한 경우
          if (selectedSeasons.includes('ALL')) {
            selectedSeasons = [season];
          } else {
            if (selectedSeasons.includes(season)) {
              // 이미 선택되어 있으면 토글 해제
              selectedSeasons = selectedSeasons.filter(s => s !== season);
              if (selectedSeasons.length === 0) {
                selectedSeasons = ['ALL']; // 아무것도 안 남으면 ALL로 복귀
              }
            } else {
              // 중복 추가 선택
              selectedSeasons.push(season);
            }
          }
        }

        // Season 필터를 누르면 상호 필터 일관성을 위해 Tournament는 ALL로 리셋 (또는 선택 유지)
        updateSeasonBtnStyles();
        renderStatistics();
      });
    });

    // 2. Tournament 드롭다운 이벤트 (단일 선택)
    tournamentFilterSelect.addEventListener('change', (e) => {
      selectedTournament = e.target.value;
      renderStatistics();
    });

    updateSeasonBtnStyles();
    renderStatistics();
  }

  function updateSeasonBtnStyles() {
    if (!seasonFilterGroup) return;
    const seasonBtns = seasonFilterGroup.querySelectorAll('.season-filter-btn');
    seasonBtns.forEach(btn => {
      const s = btn.getAttribute('data-season');
      if (selectedSeasons.includes(s)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // 3. 통계 데이터 계산 및 화면 렌더링
  function renderStatistics() {
    if (!statsOverviewGrid || !championStatsTbody || typeof golStatsDatabase === 'undefined') return;

    let displayData = null;
    let badgeText = '';

    // 토너먼트가 특정 토너먼트인 경우 해당 토너먼트 데이터 우선
    if (selectedTournament !== 'ALL' && golStatsDatabase.tournaments[selectedTournament]) {
      displayData = golStatsDatabase.tournaments[selectedTournament];
      badgeText = `Tournament: ${selectedTournament}`;
    } else {
      // Season 필터 적용
      if (selectedSeasons.includes('ALL') || selectedSeasons.length === 3) {
        displayData = golStatsDatabase.seasons['ALL'];
        badgeText = 'Season: ALL (2023, 2025, 2026)';
      } else if (selectedSeasons.length === 1) {
        const s = selectedSeasons[0];
        displayData = golStatsDatabase.seasons[s] || golStatsDatabase.seasons['ALL'];
        const sLabel = s === '2023' ? '2023 (S13)' : s === '2025' ? '2025 (S15)' : '2026 (S16)';
        badgeText = `Season: ${sLabel}`;
      } else {
        // 복수 시즌 선택 (예: 2023 + 2026) -> 선택된 시즌들 데이터 합산 집계
        displayData = aggregateSeasons(selectedSeasons);
        badgeText = `Season: ${selectedSeasons.join(', ')}`;
      }
    }

    if (activeFilterBadge) {
      activeFilterBadge.textContent = badgeText;
    }

    // 4. 핵심 지표 그리드 출력
    statsOverviewGrid.innerHTML = `
      <div class="stat-box">
        <span class="stat-number">${displayData.record || '74W - 146L'}</span>
        <span class="stat-name">MATCH RECORD (승-패)</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">${displayData.winRate || '33.6%'}</span>
        <span class="stat-name">WIN RATE (승률)</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">${displayData.kda || '2.4'}</span>
        <span class="stat-name">KDA RATIO</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">${displayData.dpm || '525.1'}</span>
        <span class="stat-name">DPM (분당 대미지)</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">${displayData.csm || '8.0'}</span>
        <span class="stat-name">CSM (분당 CS)</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">${displayData.soloKills || '58'}</span>
        <span class="stat-name">SOLO KILLS</span>
      </div>
    `;

    // 5. 챔피언 풀 테이블 출력
    const champs = displayData.champions || [];
    if (champs.length === 0) {
      championStatsTbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-muted);">
            해당 조건의 경기 기록이 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    // 경기 수 기준 내림차순 정렬
    const sortedChamps = [...champs].sort((a, b) => (b.games || 0) - (a.games || 0));

    championStatsTbody.innerHTML = sortedChamps.map(champ => {
      // 승률 색상 클래스
      const wrNum = parseFloat(champ.winRate) || 0;
      let wrClass = 'winrate-mid';
      if (wrNum >= 50) wrClass = 'winrate-high';
      else if (wrNum < 30) wrClass = 'winrate-low';

      // 롤 공식 챔피언 아이콘 CDN
      const champCleanName = champ.name.replace(/[^a-zA-Z0-9]/g, '');
      const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champCleanName}.png`;

      return `
        <tr>
          <td class="text-left">
            <div class="champion-cell">
              <img src="${iconUrl}" alt="${champ.name}" class="champ-avatar-small" onerror="this.src='profile_placeholder.svg'">
              <span>${champ.name}</span>
            </div>
          </td>
          <td class="text-center" style="font-weight: 700;">${champ.games}</td>
          <td class="text-center ${wrClass}">${champ.winRate}</td>
          <td class="text-center" style="font-weight: 700; color: #ffffff;">${champ.kda}</td>
        </tr>
      `;
    }).join('');
  }

  // 복수 시즌 합산 함수
  function aggregateSeasons(seasons) {
    let totalWins = 0;
    let totalLosses = 0;
    let totalSoloKills = 0;
    let champMap = {};

    seasons.forEach(s => {
      const data = golStatsDatabase.seasons[s];
      if (!data) return;

      const recParts = data.record.match(/(\d+)W\s*-\s*(\d+)L/);
      if (recParts) {
        totalWins += parseInt(recParts[1], 10);
        totalLosses += parseInt(recParts[2], 10);
      }
      totalSoloKills += parseInt(data.soloKills, 10) || 0;

      (data.champions || []).forEach(c => {
        if (!champMap[c.name]) {
          champMap[c.name] = { name: c.name, games: 0, wins: 0, kdaSum: 0, count: 0 };
        }
        const g = c.games || 0;
        const wr = parseFloat(c.winRate) || 0;
        champMap[c.name].games += g;
        champMap[c.name].wins += Math.round(g * (wr / 100));
        champMap[c.name].kdaSum += (parseFloat(c.kda) || 0) * g;
        champMap[c.name].count += g;
      });
    });

    const totalGames = totalWins + totalLosses;
    const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) + '%' : '0%';

    const aggregatedChamps = Object.values(champMap).map(c => {
      const wr = c.games > 0 ? ((c.wins / c.games) * 100).toFixed(1) + '%' : '0%';
      const kda = c.count > 0 ? (c.kdaSum / c.count).toFixed(1) : '-';
      return {
        name: c.name,
        games: c.games,
        winRate: wr,
        kda: kda
      };
    });

    return {
      record: `${totalWins}W - ${totalLosses}L`,
      winRate: winRate,
      kda: '2.4',
      csm: '8.0',
      gpm: '372',
      kp: '54.2%',
      dpm: '535.0',
      soloKills: totalSoloKills,
      champions: aggregatedChamps
    };
  }


  // ==========================================
  // [1] VIDEOS 메뉴 로직 (탭 필터링 + 리스트 + 상세 페이지)
  // ==========================================
  const videoListContainer = document.getElementById('video-list-container');
  const videoDetailContainer = document.getElementById('video-detail-container');
  const videoGrid = document.getElementById('videoGrid');
  const videoTabs = document.querySelectorAll('.video-tab');
  const btnBackToVideoList = document.getElementById('btnBackToVideoList');

  // 비디오 상세 DOM
  const videoDetailCategory = document.getElementById('videoDetailCategory');
  const videoDetailTitle = document.getElementById('videoDetailTitle');
  const videoDetailDate = document.getElementById('videoDetailDate');
  const videoDetailIframe = document.getElementById('videoDetailIframe');

  let currentVideoCategory = 'ALL';

  function renderVideos() {
    if (!videoGrid || typeof videoDatabase === 'undefined') return;

    const filtered = currentVideoCategory === 'ALL'
      ? videoDatabase
      : videoDatabase.filter(v => v.category === currentVideoCategory);

    if (filtered.length === 0) {
      videoGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; padding: 2rem 0;">해당 분류의 영상이 없습니다.</p>`;
      return;
    }

    videoGrid.innerHTML = filtered.map(item => `
      <article class="video-card" data-id="${item.id}">
        <div class="video-thumbnail">
          <img src="${item.thumbnail}" alt="${item.title}" class="thumb-bg" onerror="this.style.display='none'">
          <span class="video-tag">${item.category}</span>
          <div class="play-btn">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
        <div class="video-info">
          <h4>${item.title}</h4>
        </div>
      </article>
    `).join('');

    const cards = videoGrid.querySelectorAll('.video-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.getAttribute('data-id'), 10);
        showVideoDetail(id);
      });
    });
  }

  videoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      videoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentVideoCategory = tab.getAttribute('data-cat');
      renderVideos();
    });
  });

  function showVideoDetail(videoId) {
    if (typeof videoDatabase === 'undefined') return;
    const video = videoDatabase.find(v => v.id === videoId);
    if (!video) return;

    if (videoDetailCategory) videoDetailCategory.textContent = video.category;
    if (videoDetailTitle) videoDetailTitle.textContent = video.title;
    if (videoDetailDate) videoDetailDate.textContent = (video.date && video.date.length >= 16) ? video.date.substring(0, 16) : video.displayDate;
    if (videoDetailIframe) videoDetailIframe.src = video.videoUrl;

    if (videoListContainer && videoDetailContainer) {
      videoListContainer.style.display = 'none';
      videoDetailContainer.style.display = 'block';
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  if (btnBackToVideoList) {
    btnBackToVideoList.addEventListener('click', () => {
      if (videoListContainer && videoDetailContainer) {
        if (videoDetailIframe) videoDetailIframe.src = '';
        videoDetailContainer.style.display = 'none';
        videoListContainer.style.display = 'block';
      }
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  // ==========================================
  // [2] NEWS 메뉴 로직 (5개씩 페이지네이션 + 상세 페이지)
  // ==========================================
  const newsListContainer = document.getElementById('news-list-container');
  const newsDetailContainer = document.getElementById('news-detail-container');
  const newsArticleList = document.getElementById('newsArticleList');
  const newsPagination = document.getElementById('newsPagination');
  const btnBackToNewsList = document.getElementById('btnBackToNewsList');

  const detailPress = document.getElementById('detailPress');
  const detailTitle = document.getElementById('detailTitle');
  const detailDate = document.getElementById('detailDate');
  const detailImage = document.getElementById('detailImage');
  const detailImageBox = document.getElementById('detailImageBox');
  const detailContent = document.getElementById('detailContent');

  const ITEMS_PER_PAGE = 5;
  let currentPage = 1;

  function getFilteredAndSortedNews() {
    if (typeof newsDatabase === 'undefined' || !Array.isArray(newsDatabase)) {
      return [];
    }
    const filtered = newsDatabase.filter(item => {
      const targetText = `${item.title} ${item.content} ${item.summary}`.toLowerCase();
      return targetText.includes('따혁') || targetText.includes('ddahyuk');
    });
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function renderNewsList() {
    if (!newsArticleList) return;
    const articles = getFilteredAndSortedNews();
    const totalItems = articles.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    if (totalItems === 0) {
      newsArticleList.innerHTML = `<p class="no-news" style="color: var(--text-muted); padding: 2rem 0;">조회된 뉴스가 없습니다.</p>`;
      if (newsPagination) newsPagination.innerHTML = '';
      return;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = articles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    newsArticleList.innerHTML = pageItems.map(item => {
      const hasThumb = Boolean(item.thumbnail);
      const thumbHtml = hasThumb ? `
        <div class="news-thumbnail-box">
          <img src="${item.thumbnail}" alt="${item.title}" class="news-thumb-img" loading="lazy">
        </div>
      ` : '';

      return `
        <article class="news-card-link" data-id="${item.id}">
          <div class="news-card-body">
            <div class="news-meta-info">
              <span class="news-press">${item.press}</span>
              <span class="news-date">${item.displayDate}</span>
            </div>
            <h3 class="news-title">${item.title}</h3>
            <p class="news-summary">${item.summary}</p>
          </div>
          ${thumbHtml}
        </article>
      `;
    }).join('');

    const newsCards = newsArticleList.querySelectorAll('.news-card-link');
    newsCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.getAttribute('data-id'), 10);
        showNewsDetail(id);
      });
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!newsPagination) return;
    if (totalPages <= 1) {
      newsPagination.innerHTML = '';
      return;
    }

    let paginationHtml = '';
    paginationHtml += `
      <button type="button" class="page-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <button type="button" class="page-btn num-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    paginationHtml += `
      <button type="button" class="page-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;

    newsPagination.innerHTML = paginationHtml;

    const pageButtons = newsPagination.querySelectorAll('.page-btn:not(:disabled)');
    pageButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = parseInt(btn.getAttribute('data-page'), 10);
        if (targetPage && targetPage !== currentPage) {
          currentPage = targetPage;
          renderNewsList();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function showNewsDetail(articleId) {
    const articles = getFilteredAndSortedNews();
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    detailPress.textContent = article.press;
    detailTitle.textContent = article.title;
    detailDate.textContent = article.date.substring(0, 16);
    detailContent.innerHTML = article.content;

    if (article.thumbnail) {
      detailImage.src = article.thumbnail;
      detailImageBox.style.display = 'block';
    } else {
      detailImageBox.style.display = 'none';
    }

    if (newsListContainer && newsDetailContainer) {
      newsListContainer.style.display = 'none';
      newsDetailContainer.style.display = 'block';
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  if (btnBackToNewsList) {
    btnBackToNewsList.addEventListener('click', () => {
      if (newsListContainer && newsDetailContainer) {
        newsDetailContainer.style.display = 'none';
        newsListContainer.style.display = 'block';
      }
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  // ==========================================
  // [3] 페이지 뷰 전환 함수 (SPA)
  // ==========================================
  function switchPage(targetId) {
    pageViews.forEach(view => {
      view.classList.remove('active');
    });

    gnbLinks.forEach(link => {
      link.classList.remove('active');
    });

    if (targetId === 'videos' && videoListContainer && videoDetailContainer) {
      if (videoDetailIframe) videoDetailIframe.src = '';
      videoDetailContainer.style.display = 'none';
      videoListContainer.style.display = 'block';
    }

    if (targetId === 'news' && newsListContainer && newsDetailContainer) {
      newsDetailContainer.style.display = 'none';
      newsListContainer.style.display = 'block';
    }

    const targetView = document.getElementById(`view-${targetId}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    const activeLink = document.querySelector(`.gnb-link[data-target="${targetId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  gnbLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      switchPage(target);
      history.pushState(null, '', `#${target}`);
    });
  });

  if (homeLogo) {
    homeLogo.addEventListener('click', (e) => {
      e.preventDefault();
      switchPage('home');
      history.pushState(null, '', window.location.pathname);
    });
  }

  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      switchPage(hash);
    } else {
      switchPage('home');
    }
  });

  // 초기 렌더링
  initStatistics();
  renderVideos();
  renderNewsList();

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(`view-${initialHash}`)) {
    switchPage(initialHash);
  }
});
