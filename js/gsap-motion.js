/* =========================================================
   RIPE — gsap-motion.js  (1 + 2차: index.html + 서브페이지 전체)
   - prefers-reduced-motion → 즉시 반환, 전 콘텐츠 노출
   - GSAP 미로드 → IntersectionObserver 폴백
   - Lenis 제거 (입력 지연 이슈) — 마퀴 잔향은 native scroll velocity 사용
   - 모든 reveal: fromTo (CSS 초기 상태 충돌 방지)
   - 이미지 패럴랙스: scale 헤드룸 필수 (scale:1.18, 이동범위 ±6%)
   ========================================================= */
(function () {
  'use strict';

  /* ===== 0. prefers-reduced-motion 조기 반환 =====
     motion-ready 미적용 → CSS 숨김 규칙 미작동 → 전부 즉시 노출 */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    /* 모션 민감 사용자: 자동재생 영상도 정지(움직임 최소화) */
    document.querySelectorAll('video[autoplay]').forEach(function (v) {
      v.removeAttribute('autoplay');
      try { v.pause(); } catch (e) { /* 무시 */ }
    });
    return;
  }

  /* ===== 1. GSAP 로드 확인 ===== */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    fallbackReveal();
    return;
  }

  /* ===== 2. 플러그인 등록 ===== */
  gsap.registerPlugin(ScrollTrigger);

  if (typeof CustomEase !== 'undefined') {
    gsap.registerPlugin(CustomEase);
    /* Dew Condense 이징:
       중반에서 살짝 더 번지듯 흐려졌다가 선명하게 맺히는 감각.
       향이 응결되는 느낌을 이징 커브로 표현. */
    CustomEase.create('dewCondense',
      'M0,0 C0.08,0 0.20,0.22 0.36,0.46 0.44,0.58 0.50,0.73 0.58,0.83 0.70,0.95 0.86,1 1,1');
  }
  var DEW_EASE = typeof CustomEase !== 'undefined' ? 'dewCondense' : 'power3.out';

  /* ===== 3. motion-ready 선언 ===== */
  document.documentElement.classList.add('motion-ready');

  /* ===== 4. Native scroll velocity (마퀴 잔향용) =====
     Lenis 제거 후 native scrollY 차분으로 속도 추정.
     marquee ticker에서 지수 감쇠로 잔향 효과 구현. */
  var _lastScrollY = window.scrollY;
  var _scrollVel = 0;
  window.addEventListener('scroll', function () {
    _scrollVel = Math.abs(window.scrollY - _lastScrollY);
    _lastScrollY = window.scrollY;
  }, { passive: true });

  /* ===== 5. 헤더 scrolled 토글 ===== */
  (function () {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle('scrolled', window.scrollY > 150);
        ticking = false;
      });
    }, { passive: true });
  })();

  /* ================================================================
     공통 유틸 (index + 서브페이지 모두 사용)
     ================================================================ */

  /* Dew Condense 타이틀 리빌
     fromTo로 도착점 명시 — CSS .motion-ready .dew-title{opacity:0}과 충돌 방지. */
  function initDewTitles() {
    gsap.utils.toArray('.dew-title').forEach(function (el) {
      var natLS = getComputedStyle(el).letterSpacing;
      if (!natLS || natLS === 'normal') natLS = '0px';
      gsap.fromTo(el,
        { opacity: 0.12, filter: 'blur(18px)', letterSpacing: '0.28em' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          letterSpacing: natLS,
          duration: 1.35,
          ease: DEW_EASE,
          clearProps: 'filter',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* 일반 [data-reveal] 배치 리빌
     exclude: 제외할 CSS 셀렉터 문자열 (optional) */
  function initBatchReveal(exclude) {
    var selector = exclude
      ? '[data-reveal]:not(' + exclude + ')'
      : '[data-reveal]';
    var targets = gsap.utils.toArray(selector);
    if (!targets.length) return;

    ScrollTrigger.batch(targets, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.fromTo(batch,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out', stagger: 0.09, overwrite: true }
        );
      },
    });
  }

  /* 푸터 스태거 (공통) */
  function initFooter() {
    var els = gsap.utils.toArray('.footer-logo, .footer-desc, .footer-legal, .footer-col');
    if (!els.length) return;

    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.82,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: '.site-footer',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /* ================================================================
     서브페이지 공통: page-hero h1 Dew + 서브텍스트 fade
     ================================================================ */
  function initPageHero() {
    var hero = document.querySelector('.page-hero');
    if (!hero) return;

    var h1 = hero.querySelector('h1');
    var sub = hero.querySelector('p');

    if (h1) {
      var natLS = getComputedStyle(h1).letterSpacing;
      if (!natLS || natLS === 'normal') natLS = '0px';
      /* immediateRender: true(기본) → 첫 프레임에 초기 상태 즉시 적용, FOUC 없음 */
      gsap.fromTo(h1,
        { opacity: 0.12, filter: 'blur(18px)', letterSpacing: '0.28em' },
        { opacity: 1, filter: 'blur(0px)', letterSpacing: natLS, duration: 1.2, ease: DEW_EASE, clearProps: 'filter' }
      );
    }
    if (sub) {
      gsap.fromTo(sub,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', delay: 0.38 }
      );
    }
  }

  /* ================================================================
     INDEX.HTML 전용 함수들
     ================================================================ */

  /* 히어로 시네마틱 scrub
     hero-img 줌 + dark veil 페이드 (scrub:1.2, compositor only). */
  function initHeroScrub() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var heroImg = document.querySelector('.hero-img');
    var veil = document.querySelector('.hero-dark-veil');

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });
    if (heroImg) tl.to(heroImg, { scale: 1.05, ease: 'none', transformOrigin: 'center center' }, 0);
    if (veil)    tl.to(veil,    { opacity: 1,  ease: 'none' }, 0);
  }

  /* INTRO 라인 마스크 리빌
     .line-wrap{overflow:hidden} > .line-inner 아래→위 슬라이드. */
  function initIntroLines() {
    var lines = gsap.utils.toArray('.intro-inner .line-inner');
    if (!lines.length) return;

    gsap.fromTo(lines,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: {
          trigger: '.intro-inner',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /* 섹션 헤드 서브 요소 리빌 (h2.dew-title 제외, .section-sub / .view-all만) */
  function initSectionHeads() {
    gsap.utils.toArray('.section-head').forEach(function (head) {
      var subEls = Array.from(head.querySelectorAll('.section-sub, .view-all'));
      if (!subEls.length) return;

      gsap.fromTo(subEls,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out',
          stagger: 0.08,
          delay: 0.28,
          scrollTrigger: {
            trigger: head,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* BEST ITEMS 카드 스태거
     CSS .motion-ready #bestGrid > li { opacity:0 } 초기 상태와 짝. */
  function initBestGrid() {
    var items = gsap.utils.toArray('#bestGrid > li');
    if (!items.length) return;

    gsap.fromTo(items,
      { opacity: 0, y: 26, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.88,
        ease: 'power2.out',
        stagger: 0.09,
        scrollTrigger: {
          trigger: '#bestGrid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /* FEATURED 아이리스 리빌 + 리스트 x 드리프트 */
  function initFeatured() {
    var video = document.querySelector('.video-placeholder');
    if (video) {
      gsap.fromTo(video,
        { clipPath: 'circle(0% at 50% 50%)', scale: 0.97 },
        {
          clipPath: 'circle(100% at 50% 50%)',
          scale: 1,
          duration: 1.35,
          ease: 'power3.out',
          clearProps: 'clipPath,scale',
          scrollTrigger: {
            trigger: video,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    var rows = gsap.utils.toArray('#featuredList .featured-row');
    if (rows.length) {
      gsap.fromTo(rows,
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.82,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: '#featuredList',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  /* BEAUTY SELECTION 교차 드리프트 + 이미지 패럴랙스
     scale:1.18 헤드룸 → ±6% 이동 시 가장자리 노출 없음. */
  function initSelection() {
    var cards = gsap.utils.toArray('#selectionGrid .selection-card');
    if (!cards.length) return;

    cards.forEach(function (card, i) {
      var xDir = i % 2 === 0 ? -22 : 22;
      gsap.fromTo(card,
        { opacity: 0, x: xDir, y: 18 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.95,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            toggleActions: 'play none none none',
          },
          delay: i * 0.08,
        }
      );
    });

    gsap.matchMedia().add('(min-width: 861px)', function () {
      cards.forEach(function (card) {
        var img = card.querySelector('.media img');
        if (!img) return;
        gsap.set(img, { scale: 1.18, transformOrigin: 'center center' });
        gsap.fromTo(img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });
  }

  /* EVENT 오프셋 패럴랙스 (데스크탑 전용)
     두 이미지에 서로 다른 yPercent 범위 → 오프셋 깊이감. */
  function initEventParallax() {
    gsap.matchMedia().add('(min-width: 861px)', function () {
      var phs = document.querySelectorAll('.event-ph');
      if (phs.length < 2) return;

      var sharedTrigger = {
        trigger: '.event-grid',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
        invalidateOnRefresh: true,
      };

      var img0 = phs[0].querySelector('img');
      var img1 = phs[1].querySelector('img');

      if (img0) {
        gsap.set(img0, { scale: 1.18, transformOrigin: 'center center' });
        gsap.fromTo(img0, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: sharedTrigger });
      }
      if (img1) {
        gsap.set(img1, { scale: 1.18, transformOrigin: 'center center' });
        gsap.fromTo(img1, { yPercent: -7 }, { yPercent: 4, ease: 'none', scrollTrigger: sharedTrigger });
      }
    });
  }

  /* INSTAGRAM Linger Ticker (마퀴)
     - 데스크탑: GSAP ticker + native scroll velocity 잔향
     - 모바일: CSS animation만 (ticker 미실행)
     - hover/focus: 일시정지 */
  function initMarquee() {
    var topBand = document.getElementById('marqueeTop');
    var botBand = document.getElementById('marqueeBot');
    if (!topBand || !botBand) return;

    var topTrack = topBand.querySelector('.marquee-track');
    var botTrack = botBand.querySelector('.marquee-track');
    if (!topTrack || !botTrack) return;

    var firstContent = topTrack.querySelector('.marquee-content');
    if (!firstContent) return;

    /* 인스타 섹션(마퀴 부모) — 뷰포트 밖이면 ticker 정지(상시 RAF 제거) */
    var instaSection = topBand.closest('.instagram') || topBand;
    var tickFn = null;       // gsap.ticker 콜백 참조 (add/remove용)
    var marqueeST = null;    // 가시성 게이트 ScrollTrigger

    function startMarqueeTicker() {
      var singleW = firstContent.offsetWidth;
      if (singleW <= 0) return;

      topTrack.style.animation = 'none';
      botTrack.style.animation = 'none';

      var topX = 0;
      var botX = -singleW;
      var baseSpeed = 0.44;
      var velBoost = 0;

      var setTopX = gsap.quickSetter(topTrack, 'x', 'px');
      var setBotX = gsap.quickSetter(botTrack, 'x', 'px');

      var paused = false;
      [topBand, botBand].forEach(function (band) {
        band.addEventListener('mouseenter', function () { paused = true; });
        band.addEventListener('mouseleave', function () { paused = false; });
        band.addEventListener('focusin',    function () { paused = true; });
        band.addEventListener('focusout',   function () { paused = false; });
      });

      tickFn = function () {
        if (paused) return;
        /* native scroll velocity 잔향 (지수 감쇠) */
        velBoost = _scrollVel * 0.32;
        _scrollVel *= 0.88;

        var speed = baseSpeed + velBoost;
        topX -= speed;
        botX += speed;
        if (topX <= -singleW) topX += singleW;
        if (botX >= 0)        botX -= singleW;
        setTopX(topX);
        setBotX(botX);
      };

      /* 가시성 게이트: 섹션이 화면 안에 있을 때만 ticker 가동 */
      function addTick()    { if (tickFn) gsap.ticker.add(tickFn); }
      function removeTick() { if (tickFn) gsap.ticker.remove(tickFn); }
      marqueeST = ScrollTrigger.create({
        trigger: instaSection,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: function (self) { self.isActive ? addTick() : removeTick(); },
      });
      if (marqueeST.isActive) addTick();
    }

    gsap.matchMedia().add('(min-width: 861px)', function () {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(startMarqueeTicker);
      } else {
        setTimeout(startMarqueeTicker, 300);
      }
      return function () {
        if (tickFn) { gsap.ticker.remove(tickFn); tickFn = null; }
        if (marqueeST) { marqueeST.kill(); marqueeST = null; }
        topTrack.style.animation = '';
        botTrack.style.animation = '';
      };
    });
  }

  /* ================================================================
     서브페이지 전용 함수들
     ================================================================ */

  /* --- Story --- */
  function initStoryPage() {
    var storyHero = document.querySelector('.story-hero');
    if (!storyHero) return;

    /* story-hero 풀블리드 패럴랙스 (데스크탑)
       scale 헤드룸으로 위아래 빈 띠 노출 방지. */
    var storyHeroImg = storyHero.querySelector('img');
    if (storyHeroImg) {
      gsap.matchMedia().add('(min-width: 861px)', function () {
        gsap.set(storyHeroImg, { scale: 1.18, transformOrigin: 'center center' });
        gsap.fromTo(storyHeroImg,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: storyHero,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }

    /* story-figure: clip-path inset 하→상 리빌 + 이미지 미세 패럴랙스
       HTML에서 data-reveal 제거됨 → batch와 충돌 없음.
       CSS .motion-ready .story-figure { clip-path: inset(100% 0% 0% 0%) } 초기 상태와 짝. */
    gsap.utils.toArray('.story-figure').forEach(function (fig) {
      gsap.fromTo(fig,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.1,
          ease: 'power3.out',
          /* clearProps 금지: 제거 시 CSS .motion-ready .story-figure{clip-path:inset(100%)}로
             되돌아가 figure가 다시 숨겨짐. 인라인 inset(0%)를 유지해야 보인다. */
          scrollTrigger: {
            trigger: fig,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
      gsap.matchMedia().add('(min-width: 861px)', function () {
        var img = fig.querySelector('img');
        if (!img) return;
        gsap.set(img, { scale: 1.18, transformOrigin: 'center center' });
        gsap.fromTo(img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: fig,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });

    /* pull-quote 라인 마스크 리빌
       HTML .line-wrap{overflow:hidden} > .line-inner 구조와 짝.
       CSS .motion-ready .pull-quote .line-inner { transform: translateY(110%) } 초기 상태. */
    gsap.utils.toArray('.pull-quote').forEach(function (pq) {
      var lines = pq.querySelectorAll('.line-inner');
      if (!lines.length) return;
      gsap.fromTo(lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.0,
          ease: 'power3.out',
          stagger: 0.11,
          scrollTrigger: {
            trigger: pq,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
    /* 나머지 [data-reveal] (본문 p, .story-cta) 은 initBatchReveal이 담당 */
  }

  /* --- Shop --- */
  function initShopPage() {
    var shopGrid = document.getElementById('shopGrid');
    if (!shopGrid) return;
    /* main.js(defer)가 먼저 renderShop()을 동기 실행 → rAF 시점엔 이미 렌더됨 */
    var items = gsap.utils.toArray('#shopGrid > li');
    if (!items.length) return;

    gsap.fromTo(items,
      { opacity: 0, y: 22, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.82,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: shopGrid,
          start: 'top 86%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /* --- Product (PDP) --- */
  function initProductPage() {
    var pdpEl = document.getElementById('productDetail');
    if (!pdpEl) return;

    function animatePdp() {
      /* 좌측 갤러리 */
      var gallery = pdpEl.querySelector('.pdp-gallery');
      if (gallery) {
        gsap.fromTo(gallery,
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' }
        );
      }
      /* 우측 정보 컬럼 순차 리빌 */
      var infoEls = Array.from(pdpEl.querySelectorAll(
        '.pdp-cat, .pdp-name, .pdp-type, .pdp-price, .pdp-desc, .pdp-notes, .pdp-meta, .pdp-actions'
      ));
      if (infoEls.length) {
        gsap.fromTo(infoEls,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out', stagger: 0.08, delay: 0.12 }
        );
      }
    }

    if (pdpEl.children.length > 0) {
      animatePdp();
    } else {
      /* 렌더가 아직 안 된 극단적 케이스 대비 */
      var obs = new MutationObserver(function (_, observer) {
        if (pdpEl.children.length > 0) { observer.disconnect(); animatePdp(); }
      });
      obs.observe(pdpEl, { childList: true });
    }

    /* 추천 그리드 */
    var recGrid = document.getElementById('pdpRecommend');
    if (!recGrid) return;
    var recItems = gsap.utils.toArray('#pdpRecommend > li');
    if (recItems.length) {
      gsap.fromTo(recItems,
        { opacity: 0, y: 20, scale: 0.98 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8, ease: 'power2.out', stagger: 0.09,
          scrollTrigger: { trigger: recGrid, start: 'top 86%', toggleActions: 'play none none none' },
        }
      );
    } else {
      var obs2 = new MutationObserver(function (_, observer) {
        var items = Array.from(recGrid.querySelectorAll('li'));
        if (items.length) {
          observer.disconnect();
          gsap.fromTo(items,
            { opacity: 0, y: 20, scale: 0.98 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.8, ease: 'power2.out', stagger: 0.09,
              scrollTrigger: { trigger: recGrid, start: 'top 86%', toggleActions: 'play none none none' },
            }
          );
        }
      });
      obs2.observe(recGrid, { childList: true });
    }
  }

  /* --- Journal list --- */
  function initJournalPage() {
    var grid = document.getElementById('journalGrid');
    if (!grid) return;

    var items = gsap.utils.toArray('#journalGrid > li');
    if (items.length) {
      gsap.fromTo(items,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0,
          duration: 0.85, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: grid, start: 'top 86%', toggleActions: 'play none none none' },
        }
      );
    } else {
      var obs = new MutationObserver(function (_, observer) {
        var els = Array.from(grid.querySelectorAll('li'));
        if (els.length) {
          observer.disconnect();
          gsap.fromTo(els,
            { opacity: 0, y: 24 },
            {
              opacity: 1, y: 0,
              duration: 0.85, ease: 'power2.out', stagger: 0.08,
              scrollTrigger: { trigger: grid, start: 'top 86%', toggleActions: 'play none none none' },
            }
          );
        }
      });
      obs.observe(grid, { childList: true });
    }
  }

  /* --- Journal Article --- */
  function initArticlePage() {
    var articleRoot = document.getElementById('articleRoot');
    if (!articleRoot) return;

    function animateArticle() {
      /* 대표 figure (article-figure) clip-path 리빌 + 패럴랙스 */
      var figure = articleRoot.querySelector('.article-figure');
      if (figure) {
        gsap.fromTo(figure,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.15, ease: 'power3.out',
            /* clearProps 금지: CSS 초기 clip(inset 100%)로 되돌아가 다시 숨겨짐 방지 */
          }
        );
        gsap.matchMedia().add('(min-width: 861px)', function () {
          var img = figure.querySelector('img');
          if (!img) return;
          gsap.set(img, { scale: 1.18, transformOrigin: 'center center' });
          gsap.fromTo(img,
            { yPercent: -6 },
            {
              yPercent: 6, ease: 'none',
              scrollTrigger: {
                trigger: figure, start: 'top bottom', end: 'bottom top',
                scrub: 1.5, invalidateOnRefresh: true,
              },
            }
          );
        });
      }
      /* 제목 Dew (article-title)
         CSS .motion-ready .article-title { opacity:0 } 초기 상태와 짝. */
      var title = articleRoot.querySelector('.article-title');
      if (title) {
        var natLS = getComputedStyle(title).letterSpacing;
        if (!natLS || natLS === 'normal') natLS = '0px';
        gsap.fromTo(title,
          { opacity: 0.12, filter: 'blur(14px)', letterSpacing: '0.2em' },
          { opacity: 1, filter: 'blur(0px)', letterSpacing: natLS, duration: 1.2, ease: DEW_EASE, clearProps: 'filter', delay: 0.1 }
        );
      }
      /* 본문 단락 stagger */
      var body = articleRoot.querySelector('.article-body');
      if (body) {
        var paras = Array.from(body.querySelectorAll('p'));
        if (paras.length) {
          gsap.fromTo(paras,
            { opacity: 0, y: 18 },
            {
              opacity: 1, y: 0,
              duration: 0.8, ease: 'power2.out', stagger: 0.09,
              scrollTrigger: { trigger: body, start: 'top 85%', toggleActions: 'play none none none' },
            }
          );
        }
      }
    }

    if (articleRoot.children.length > 0) {
      animateArticle();
    } else {
      var obs = new MutationObserver(function (_, observer) {
        if (articleRoot.children.length > 0) {
          observer.disconnect();
          requestAnimationFrame(animateArticle);
        }
      });
      obs.observe(articleRoot, { childList: true });
    }

    /* 추천 저널 카드 stagger */
    var recGrid = document.getElementById('articleRecommend');
    if (!recGrid) return;
    var recItems = Array.from(recGrid.querySelectorAll('li'));
    if (recItems.length) {
      gsap.fromTo(recItems,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.8, ease: 'power2.out', stagger: 0.1,
          scrollTrigger: { trigger: recGrid, start: 'top 88%', toggleActions: 'play none none none' },
        }
      );
    } else {
      var obs2 = new MutationObserver(function (_, observer) {
        var items = Array.from(recGrid.querySelectorAll('li'));
        if (items.length) {
          observer.disconnect();
          gsap.fromTo(items,
            { opacity: 0, y: 20 },
            {
              opacity: 1, y: 0,
              duration: 0.8, ease: 'power2.out', stagger: 0.1,
              scrollTrigger: { trigger: recGrid, start: 'top 88%', toggleActions: 'play none none none' },
            }
          );
        }
      });
      obs2.observe(recGrid, { childList: true });
    }
  }

  /* --- Cart --- */
  function initCartPage() {
    /* 카트 아이템 (main.js renderCart로 동기 렌더) */
    var cartItems = Array.from(document.querySelectorAll('#cartList .cart-item, #cartList li'));
    if (cartItems.length) {
      gsap.fromTo(cartItems,
        { opacity: 0, x: -14 },
        {
          opacity: 1, x: 0,
          duration: 0.7, ease: 'power2.out', stagger: 0.07,
        }
      );
    }
    /* 주문 요약 사이드바 */
    var summary = document.getElementById('cartSummary');
    if (summary) {
      gsap.fromTo(summary,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
      );
    }
  }

  /* --- Login --- */
  function initLoginPage() {
    var authCard = document.querySelector('.auth-card');
    if (!authCard) return;
    gsap.fromTo(authCard,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out' }
    );
  }

  /* --- Contact --- */
  function initContactPage() {
    var grid = document.querySelector('.contact-grid');
    if (!grid) return;
    var cols = Array.from(grid.children);
    if (!cols.length) return;
    gsap.fromTo(cols,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: grid, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  }

  /* --- Legal (terms / privacy) --- */
  function initLegalPage() {
    var sections = gsap.utils.toArray('.legal-doc section');
    if (!sections.length) return;
    gsap.fromTo(sections,
      { opacity: 0, y: 14 },
      {
        opacity: 1, y: 0,
        duration: 0.75, ease: 'power2.out', stagger: 0.06,
        scrollTrigger: { trigger: '.legal-doc', start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  }

  /* ================================================================
     폴백: GSAP 미로드 시 IntersectionObserver 방식
     ================================================================ */
  function fallbackReveal() {
    /* no-gsap: GSAP 전용 게이트 요소(.dew-title, #bestGrid>li, page-hero h1,
       #shopGrid>li, #journalGrid>li, story/article-figure, article-title,
       auth-card)를 CSS에서 강제 노출 — 폴백이 콘텐츠를 숨긴 채 두는 것 방지. */
    document.documentElement.classList.add('no-gsap');
    document.documentElement.classList.add('motion-ready');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var targets = document.querySelectorAll('[data-reveal]');
        if (!targets.length) return;
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
        targets.forEach(function (el) { observer.observe(el); });
        var header = document.getElementById('siteHeader');
        if (header) {
          window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 150);
          }, { passive: true });
        }
      });
    });
  }

  /* ================================================================
     Boot
     main.js(defer) → GSAP CDN(defer) → gsap-motion.js(defer) 순서 보장.
     main.js 동기 렌더(renderCards 등) 완료 후 실행됨.
     rAF 1회: 브라우저 레이아웃 안정화 후 GSAP 트리거/측정 시작.
     ================================================================ */
  requestAnimationFrame(function () {
    /* 공통 */
    initDewTitles();
    initFooter();

    var isIndex = !!document.querySelector('.hero');

    if (isIndex) {
      /* ── index.html ── */
      initHeroScrub();
      initIntroLines();
      initSectionHeads();
      initBestGrid();
      initFeatured();
      initSelection();
      initEventParallax();
      initMarquee();
      /* selection-card 제외: initSelection이 별도 처리 */
      initBatchReveal('.selection-card');
    } else {
      /* ── 서브페이지 ── */
      initPageHero();
      initBatchReveal(); /* 모든 [data-reveal] */

      if (document.querySelector('.story-hero'))       initStoryPage();
      if (document.getElementById('shopGrid'))         initShopPage();
      if (document.getElementById('productDetail'))    initProductPage();
      if (document.getElementById('journalGrid'))      initJournalPage();
      if (document.getElementById('articleRoot'))      initArticlePage();
      if (document.querySelector('.cart-layout'))      initCartPage();
      if (document.querySelector('.auth-card'))        initLoginPage();
      if (document.querySelector('.contact-grid'))     initContactPage();
      if (document.querySelector('.legal-doc'))        initLegalPage();
    }

    /* 이미지/폰트 전부 로드 후 ScrollTrigger 재계산
       (lazy img 높이가 확정되어야 패럴랙스 위치 정확) */
    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
    });
  });

})();
