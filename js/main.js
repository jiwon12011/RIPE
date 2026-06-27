/* =========================================================
   RIPE — main.js
   역할: 1) 제품 데이터 단일 소스  2) 섹션 렌더  3) 헤더 드로어
   (스크롤/모션 연출은 별도 js 에서 [data-reveal] 훅으로 얹는다)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. 제품 데이터 (단일 소스) ----------
     가격은 숫자, 이미지 경로는 slug 규칙 생성. category 는 필터/추천용 키.
     desc·notes·longevity 는 product.html 데이터 구동. howto 는 카테고리 공통이라
     아래 HOWTO 맵에서 일괄 주입(중복 카피 단일화). */
  const PRODUCTS = [
    {
      slug: 'fig-pear', name: 'Fig & Pear', type: 'Eau de Parfum 50ml', price: 168000,
      category: 'eau-de-parfum',
      desc: '무화과 특유의 그늘진 달콤함과 싱그러운 배의 과즙이 만난다. 나무 아래 서 있는 것처럼 무겁지 않게, 하지만 선명하게 남는 향이다. 시간이 지날수록 나무껍질의 따뜻함이 올라오며 깊어진다.',
      notes: { top: 'Green Fig, Pear', heart: 'Fig Leaf, White Musk', base: 'Cedarwood, Sandalwood, Vetiver' },
      longevity: '지속 약 6~8시간 · 50ml',
    },
    {
      slug: 'peach-blossom', name: 'Peach Blossom', type: 'Eau de Parfum 50ml', price: 166000,
      category: 'eau-de-parfum',
      desc: '막 벌어진 복숭아꽃과 과즙이 흐르는 속살. 달큼한 꽃향이 먼저 번지고, 그 아래로 보송한 살결 같은 머스크가 받친다. 가까이 다가올수록 은은하게 피어나는, 따뜻하고 포근한 잔향.',
      notes: { top: 'Peach, Nectarine', heart: 'Peach Blossom, Jasmine', base: 'White Musk, Soft Amber' },
      longevity: '지속 약 5~7시간 · 50ml',
    },
    {
      slug: 'black-cherry', name: 'Black Cherry', type: 'Eau de Parfum 50ml', price: 168000,
      category: 'eau-de-parfum',
      desc: '잘 익은 블랙 체리의 과즙이 터지는 순간, 그 아래 장미의 그늘이 받친다. 달콤하지만 무겁지 않고, 관능적이지만 조용하다. 저녁이 깊어질수록 더 선명해지는 향.',
      notes: { top: 'Black Cherry, Bergamot', heart: 'Rose, Violet', base: 'Dark Musk, Patchouli, Warm Amber' },
      longevity: '지속 약 6~8시간 · 50ml',
    },
    {
      slug: 'orchard', name: 'Orchard', type: 'Body Oil 100ml', price: 68000,
      category: 'body-oil',
      desc: '이른 아침 과수원 — 이슬이 맺힌 잎사귀와 아직 차가운 흙, 그 위로 복숭아와 배의 향이 얹힌다. 피부 위에서 부드럽게 퍼지고, 몸의 온기와 함께 오랫동안 머문다.',
      notes: { top: 'Peach, Pear, Aquatic Dewdrop', heart: 'Orchard Blossom, Green Leaf', base: 'Sandalwood, Light Musk' },
      longevity: '잔향 약 2~3개월 · 100ml',
    },
    {
      slug: 'pear-blossom', name: 'Pear Blossom', type: 'Body Oil 100ml', price: 66000,
      category: 'body-oil',
      desc: '비 갠 뒤 배밭의 공기 — 젖은 꽃잎과 풋풋한 배의 살결이 함께 묻어난다. 가볍게 스며들어 피부를 매끄럽게 감싸고, 은은한 잔향이 오래 머문다.',
      notes: { top: 'Pear, Dewy Petal', heart: 'Pear Blossom, Freesia', base: 'Cashmere Musk, Cedar' },
      longevity: '잔향 약 2~3개월 · 100ml',
    },
    {
      slug: 'peach-silk', name: 'Peach Silk', type: 'Body Oil 100ml', price: 66000,
      category: 'body-oil',
      desc: '잘 익은 복숭아의 보드라운 솜털을 닮은 오일. 피부에 닿으면 비단처럼 부드럽게 퍼지고, 따뜻한 과육의 단내가 살결 위에 곱게 남는다.',
      notes: { top: 'Peach, Apricot', heart: 'Peach Flower, Orris', base: 'Vanilla Musk, Sandalwood' },
      longevity: '잔향 약 2~3개월 · 100ml',
    },
    {
      slug: 'honey-fig', name: 'Honey Fig', type: 'Lip Balm 8g', price: 32000,
      category: 'lip-balm',
      desc: '잘 익은 무화과의 과육과 한 방울의 꿀. 입술에 닿으면 매끄럽게 녹아 촉촉함을 채우고, 달콤하고 따뜻한 향이 은은하게 감돈다.',
      notes: { top: 'Fig, Honey', heart: 'Fig Milk, Fig Leaf', base: 'Soft Vanilla, Musk' },
      longevity: '수시로 사용 · 8g',
    },
    {
      slug: 'cherry-glow', name: 'Cherry Glow', type: 'Lip Balm 8g', price: 32000,
      category: 'lip-balm',
      desc: '톡 터지는 체리의 과즙으로 물든 입술. 발랐을 때 맑게 비치는 붉은 윤기와, 달콤하고 산뜻한 향이 함께 남는다.',
      notes: { top: 'Cherry, Red Berry', heart: 'Cherry Blossom, Plum', base: 'Vanilla, Light Musk' },
      longevity: '수시로 사용 · 8g',
    },
  ];

  // 사용법: 카테고리 공통 → 각 제품에 howto 주입(단일 소스)
  const HOWTO = {
    'eau-de-parfum': '샤워 후 물기가 살짝 남은 피부에 손목·목 안쪽·쇄골에 1~2회. 젖은 피부에 올릴수록 오래 유지됩니다.',
    'body-oil': '샤워 직후 물기를 닦기 전 전신에 펴 바르고 마사지하듯 흡수시키세요.',
    'lip-balm': '입술에 부드럽게, 수시로 덧발라도 좋습니다.',
  };
  PRODUCTS.forEach((p) => { p.howto = HOWTO[p.category]; });

  // 카테고리 메타(필터바·라벨용). order = 필터 버튼 순서
  const CATEGORY_META = [
    { key: 'eau-de-parfum', label: 'Eau de Parfum' },
    { key: 'body-oil',      label: 'Body Oil' },
    { key: 'lip-balm',      label: 'Lip Balm' },
  ];

  const BASE = 'assets/images/products/';
  const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
  const get = (slug) => bySlug.get(slug);
  const price = (n) => n.toLocaleString('ko-KR') + '원';
  const byCategory = (cat) => PRODUCTS.filter((p) => p.category === cat);

  // 링크 헬퍼 — 죽은 링크 0
  const productHref = (slug) => `product.html?slug=${slug}`;
  const shopCatHref = (cat) => `shop.html?cat=${cat}`;
  // URL 쿼리 유틸 (가드 포함)
  const getParam = (key, fallback) => {
    try { return new URLSearchParams(location.search).get(key) || fallback; }
    catch (e) { return fallback; }
  };

  // WebP 반응형 (원본 PNG 보존, 표시 경로는 webp). role: default | hover
  const imgSrc = (slug, role) => `${BASE}${slug}/${role}.webp`;
  const imgSrcset = (slug, role) =>
    `${BASE}${slug}/${role}-400.webp 400w, ${BASE}${slug}/${role}-800.webp 800w, ${BASE}${slug}/${role}.webp 1254w`;
  // 렌더 위치별 표시폭 → sizes (다운로드 최적화)
  const SIZES = {
    card:      '(max-width:860px) calc(50vw - 1.25rem), calc(25vw - 1.5rem)',
    selection: '(max-width:860px) min(calc(100vw - 2rem), 460px), calc(33vw - 2rem)',
    thumb:     '(max-width:860px) 96px, 60px',
    insta:     '(max-width:1023px) calc(33vw - 0.5rem), calc(17vw - 0.5rem)',
  };

  /* ---------- 2. 렌더 헬퍼 ---------- */
  // 정사각 제품 미디어 (default + hover 크로스페이드). 비-LCP라 항상 lazy.
  function media(p, withHover, sizes) {
    const ss = sizes || SIZES.card;
    const h = withHover
      ? `<img class="img-hover" src="${imgSrc(p.slug, 'hover')}" srcset="${imgSrcset(p.slug, 'hover')}" sizes="${ss}"
             alt="" width="1254" height="1254" loading="lazy" decoding="async" />`
      : '';
    return `<span class="media">
      <img class="img-default" src="${imgSrc(p.slug, 'default')}" srcset="${imgSrcset(p.slug, 'default')}" sizes="${ss}"
           alt="${p.name} ${p.type}" width="1254" height="1254" loading="lazy" decoding="async" />
      ${h}
    </span>`;
  }

  /* ---------- 섹션 5. BEST ITEMS / 카드 ---------- */
  function card(p) {
    // 하트 버튼은 <a> 형제로 둔다(중첩 인터랙티브 회피). li가 위치 기준.
    return `<li class="card-cell" data-category="${p.category}"><a class="card" href="${productHref(p.slug)}">
      ${media(p, true)}
      <h3 class="card-name">${p.name}</h3>
      <p class="card-type">${p.type}</p>
      <p class="card-price">${price(p.price)}</p>
    </a>${wishBtn(p.slug)}</li>`;
  }
  function renderCards(el, slugs) {
    el.innerHTML = slugs.map((s) => card(get(s))).join('');
  }

  /* ---------- 섹션 6. FEATURED 제품 행 ---------- */
  function renderFeatured(el, slugs) {
    el.innerHTML = slugs.map((s) => {
      const p = get(s);
      return `<li><a class="featured-row swap" href="${productHref(p.slug)}">
        ${media(p, false, SIZES.thumb)}
        <span class="featured-info">
          <span class="card-name">${p.name}</span>
          <span class="card-type">${p.type}</span>
          <span class="card-price">${price(p.price)}</span>
          <span class="featured-shop">SHOP NOW ›</span>
        </span>
      </a></li>`;
    }).join('');
  }

  /* ---------- 섹션 7. BEAUTY SELECTION ---------- */
  const SELECTION = [
    { name: 'Pear Garden',  hero: 'pear-blossom', desc: '비 내린 뒤 배밭, 꽃과 흙이 섞이는 그 냄새',     items: ['pear-blossom', 'orchard'] },
    { name: 'Black Cherry', hero: 'black-cherry',  desc: '무너지기 직전으로 익은, 달고 무거운 끝맛',        items: ['black-cherry', 'cherry-glow'] },
    { name: 'Peach Veil',   hero: 'peach-blossom', desc: '복숭아 솜털처럼 가볍게, 피부에 닿으면 촉촉하게',  items: ['peach-blossom', 'peach-silk'] },
  ];
  function miniRow(p) {
    return `<a class="mini-row" href="${productHref(p.slug)}">
      <span class="media"><img src="${imgSrc(p.slug, 'default')}" srcset="${imgSrcset(p.slug, 'default')}" sizes="${SIZES.thumb}"
        alt="${p.name} ${p.type}" width="1254" height="1254" loading="lazy" decoding="async" /></span>
      <span>
        <span class="mini-name">${p.name}</span>
        <span class="mini-type">${p.type}</span>
        <span class="mini-price">${price(p.price)}</span>
      </span>
    </a>`;
  }
  function renderSelection(el) {
    el.innerHTML = SELECTION.map((s) => `
      <article class="selection-card" data-reveal>
        <a class="swap" href="${productHref(s.hero)}" aria-label="${s.name}">
          <span class="media"><img class="img-default" src="${imgSrc(s.hero, 'hover')}" srcset="${imgSrcset(s.hero, 'hover')}" sizes="${SIZES.selection}"
            alt="${s.name} 연출 컷" width="1254" height="1254" loading="lazy" decoding="async" /></span>
        </a>
        <h3 class="selection-name">${s.name}</h3>
        <p class="selection-desc">${s.desc}</p>
        <div class="selection-products">
          ${s.items.map((slug) => miniRow(get(slug))).join('')}
        </div>
      </article>`).join('');
  }

  /* ---------- 섹션 9. INSTAGRAM ----------
     에디토리얼(인물/정물) + 제품 연출컷 혼합. 항목은 두 종류 허용:
     - 제품:     { product: 'slug', role: 'default|hover' }
     - 에디토리얼: { src, srcset, alt, w, h } */
  const EDITORIAL = 'assets/images/editorial/';
  const lifeEntry = (name, alt) => {
    const base = `${EDITORIAL}lifestyle/${name}`;
    return {
      src: `${base}.webp`,
      srcset: `${base}-500.webp 500w, ${base}-800.webp 800w, ${base}.webp 1122w`,
      alt, w: 1122, h: 1402,
    };
  };
  const INSTA = [
    lifeEntry('lifestyle-bath-fig-pear', '욕실에서의 RIPE Fig & Pear'),
    {
      src: `${EDITORIAL}instagram/instagram-tote-fig-pear.webp`,
      srcset: `${EDITORIAL}instagram/instagram-tote-fig-pear-600.webp 600w, ${EDITORIAL}instagram/instagram-tote-fig-pear.webp 1254w`,
      alt: 'RIPE Fig & Pear를 담은 토트백', w: 1254, h: 1254,
    },
    lifeEntry('lifestyle-vanity-fig-pear', 'RIPE 향수가 놓인 화장대'),
    { product: 'black-cherry', role: 'hover' },
    lifeEntry('lifestyle-hand-label-fig-pear', '손에 든 RIPE Fig & Pear'),
    { product: 'peach-blossom', role: 'hover' },
  ];
  function instaTile(item) {
    let src, srcset, alt, w = 1254, h = 1254;
    if (item.product) {
      const p = get(item.product);
      src = imgSrc(item.product, item.role);
      srcset = imgSrcset(item.product, item.role);
      alt = `${p.name} ${p.type}`;
    } else {
      ({ src, srcset, alt } = item);
      w = item.w || 1254; h = item.h || 1254;
    }
    return `<li><a class="insta-tile" href="#" aria-label="${alt} 인스타그램 게시물">
      <img src="${src}" srcset="${srcset}" sizes="${SIZES.insta}"
           alt="${alt}" width="${w}" height="${h}" loading="lazy" decoding="async" />
    </a></li>`;
  }
  function renderInsta(el) {
    el.innerHTML = INSTA.map(instaTile).join('');
    // 데모: 인스타 타일은 실제 목적지가 없으므로 클릭 시 상단 점프 방지
    el.addEventListener('click', (e) => {
      const a = e.target.closest('a[href="#"]');
      if (a) e.preventDefault();
    });
  }

  /* ---------- 서브페이지: SHOP ---------- */
  // 8개 카드 렌더(card() 재사용 — li[data-category] 포함). 클릭 → product.html
  function renderShop(grid) {
    grid.innerHTML = PRODUCTS.map(card).join('');
  }
  // 카테고리 필터(리로드 없이 li.hidden 토글). ?cat 초기값 반영.
  function initShopFilter(grid) {
    const bar = document.getElementById('shopFilter');
    if (!bar) return;
    const buttons = Array.from(bar.querySelectorAll('[data-cat]'));
    const items = Array.from(grid.querySelectorAll('li'));

    function apply(cat, push) {
      items.forEach((li) => { li.hidden = !(cat === 'all' || li.dataset.category === cat); });
      buttons.forEach((b) => {
        const active = b.dataset.cat === cat;
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
        b.classList.toggle('is-active', active);
      });
      if (push && history.replaceState) {
        history.replaceState(null, '', cat === 'all' ? 'shop.html' : shopCatHref(cat));
      }
    }
    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.cat, true)));

    const requested = getParam('cat', 'all');
    const valid = buttons.some((b) => b.dataset.cat === requested) ? requested : 'all';
    apply(valid, false);
  }

  /* ---------- 서브페이지: PRODUCT ---------- */
  function productMarkup(p) {
    const note = (label, val) => `<tr><th scope="row">${label}</th><td>${val}</td></tr>`;
    const sizes = '(max-width: 860px) 100vw, 45vw';
    return `
      <div class="pdp-gallery">
        <div class="pdp-main">
          <img id="pdpMainImg" class="pdp-main-img"
               src="${imgSrc(p.slug, 'default')}" srcset="${imgSrcset(p.slug, 'default')}" sizes="${sizes}"
               alt="${p.name} ${p.type}" width="1254" height="1254"
               fetchpriority="high" decoding="async" />
        </div>
        <div class="pdp-thumbs" role="group" aria-label="제품 이미지 선택">
          <button type="button" class="pdp-thumb is-active" data-role="default" aria-label="제품 외관 이미지" aria-pressed="true">
            <img src="${imgSrc(p.slug, 'default')}" alt="" width="1254" height="1254" loading="lazy" decoding="async" />
          </button>
          <button type="button" class="pdp-thumb" data-role="hover" aria-label="제품 연출 이미지" aria-pressed="false">
            <img src="${imgSrc(p.slug, 'hover')}" alt="" width="1254" height="1254" loading="lazy" decoding="async" />
          </button>
        </div>
      </div>
      <div class="pdp-info">
        <p class="pdp-cat">${(CATEGORY_META.find((c) => c.key === p.category) || {}).label || ''}</p>
        <h1 class="pdp-name">${p.name}</h1>
        <p class="pdp-type">${p.type}</p>
        <p class="pdp-price">${price(p.price)}</p>
        <p class="pdp-desc">${p.desc}</p>

        <table class="pdp-notes">
          <caption>Scent Notes</caption>
          <tbody>
            ${note('Top', p.notes.top)}
            ${note('Heart', p.notes.heart)}
            ${note('Base', p.notes.base)}
          </tbody>
        </table>

        <dl class="pdp-meta">
          <dt>How to use</dt><dd>${p.howto}</dd>
          <dt>Longevity</dt><dd>${p.longevity}</dd>
        </dl>

        <div class="pdp-actions">
          <button type="button" class="btn btn-fill pdp-add">ADD TO CART</button>
          ${wishBtn(p.slug, 'pdp')}
        </div>
        <p class="pdp-note">* 본 페이지는 데모입니다. 실제 결제는 진행되지 않습니다.</p>
      </div>`;
  }

  function recommendations(p) {
    const same = byCategory(p.category).filter((x) => x.slug !== p.slug);
    const others = PRODUCTS.filter((x) => x.category !== p.category && x.slug !== p.slug);
    return same.concat(others).slice(0, 4);
  }

  function renderProduct() {
    const root = document.getElementById('productDetail');
    if (!root) return;
    const p = get(getParam('slug', 'fig-pear')) || get('fig-pear');

    document.title = `${p.name} · ${p.type} — RIPE`;
    const crumb = document.getElementById('pdpCrumb');
    if (crumb) crumb.textContent = p.name;

    // 동적 OG/Twitter (제품 제목·설명·이미지)
    const pTitle = `${p.name} · ${p.type} — RIPE`;
    setMeta('meta[property="og:title"]', pTitle);
    setMeta('meta[name="twitter:title"]', pTitle);
    setMeta('meta[property="og:description"]', p.desc);
    setMeta('meta[name="twitter:description"]', p.desc);
    setMeta('meta[property="og:image"]', imgSrc(p.slug, 'default'));
    setMeta('meta[name="twitter:image"]', imgSrc(p.slug, 'default'));

    root.innerHTML = productMarkup(p);

    // 갤러리 썸네일 토글
    const mainImg = root.querySelector('#pdpMainImg');
    root.querySelectorAll('.pdp-thumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        mainImg.src = imgSrc(p.slug, role);
        mainImg.srcset = imgSrcset(p.slug, role);
        mainImg.alt = role === 'hover' ? `${p.name} 연출 컷` : `${p.name} ${p.type}`;
        root.querySelectorAll('.pdp-thumb').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      });
    });

    // 장바구니 담기
    const addBtn = root.querySelector('.pdp-add');
    if (addBtn) addBtn.addEventListener('click', () => { addToCart(p.slug, 1); toast(`${p.name} 장바구니에 담겼습니다.`); });

    // 추천(같은 카테고리 우선)
    const recEl = document.getElementById('pdpRecommend');
    if (recEl) recEl.innerHTML = recommendations(p).map(card).join('');
  }

  /* ---------- 장바구니 (localStorage, 2차 cart.html 연동 대비) ---------- */
  const CART_KEY = 'ripe-cart';
  function readCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
  function writeCart(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* private mode */ }
    updateCartCount();
  }
  function addToCart(slug, qty) {
    const items = readCart();
    const hit = items.find((i) => i.slug === slug);
    if (hit) hit.qty += (qty || 1); else items.push({ slug, qty: qty || 1 });
    writeCart(items);
  }
  const cartCount = () => readCart().reduce((n, i) => n + i.qty, 0);
  function updateCartCount() {
    const n = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }
  function removeFromCart(slug) {
    writeCart(readCart().filter((i) => i.slug !== slug));
    renderCart();
  }
  function setQty(slug, qty) {
    const items = readCart();
    const hit = items.find((i) => i.slug === slug);
    if (!hit) return;
    hit.qty = Math.max(1, qty);
    writeCart(items);
    renderCart();
  }
  // cart.html 가드 렌더 — #cartList 필수, #cartTotal/#cartEmpty/#cartSummary 선택
  function renderCart() {
    const list = document.getElementById('cartList');
    if (!list) return;
    const items = readCart();
    const totalEl = document.getElementById('cartTotal');
    const emptyEl = document.getElementById('cartEmpty');
    const summaryEl = document.getElementById('cartSummary');

    const layout = document.querySelector('.cart-layout');
    if (!items.length) {
      list.innerHTML = '';
      list.hidden = true;                            // 빈 리스트(구분선만 남는 것) 숨김
      if (layout) layout.classList.add('is-empty');  // 단일 열·가운데 정렬
      if (emptyEl) emptyEl.hidden = false;
      if (summaryEl) summaryEl.hidden = true;
      if (totalEl) totalEl.textContent = price(0);
      return;
    }
    list.hidden = false;
    if (layout) layout.classList.remove('is-empty');
    if (emptyEl) emptyEl.hidden = true;
    if (summaryEl) summaryEl.hidden = false;

    let sum = 0;
    list.innerHTML = items.map((it) => {
      const p = get(it.slug); if (!p) return '';
      sum += p.price * it.qty;
      return `<li class="cart-row" data-slug="${p.slug}">
        <a class="cart-thumb media" href="${productHref(p.slug)}" aria-label="${p.name}"><img src="${imgSrc(p.slug, 'default')}" alt="" width="1254" height="1254" loading="lazy" decoding="async" /></a>
        <div class="cart-info">
          <a class="cart-name" href="${productHref(p.slug)}">${p.name}</a>
          <span class="cart-type">${p.type}</span>
          <span class="cart-price">${price(p.price)}</span>
        </div>
        <div class="cart-qty" role="group" aria-label="${p.name} 수량">
          <button type="button" class="qty-btn" data-act="dec" aria-label="수량 줄이기">−</button>
          <span class="qty-val" aria-live="polite">${it.qty}</span>
          <button type="button" class="qty-btn" data-act="inc" aria-label="수량 늘리기">+</button>
        </div>
        <button type="button" class="cart-remove" data-act="remove" aria-label="${p.name} 삭제">×</button>
      </li>`;
    }).join('');
    if (totalEl) totalEl.textContent = price(sum);

    // 이벤트 위임 (한 번만 바인딩)
    if (!list.dataset.bound) {
      list.dataset.bound = '1';
      list.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const row = btn.closest('.cart-row');
        const slug = row && row.dataset.slug;
        if (!slug) return;
        const cur = (readCart().find((i) => i.slug === slug) || {}).qty || 1;
        if (btn.dataset.act === 'remove') removeFromCart(slug);
        else if (btn.dataset.act === 'inc') setQty(slug, cur + 1);
        else if (btn.dataset.act === 'dec') setQty(slug, cur - 1);
      });
    }
  }

  /* ---------- 위시리스트 (localStorage, 하트 토글 + 카운트) ---------- */
  const WISH_KEY = 'ripe-wishlist';
  function readWish() { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch (e) { return []; } }
  function writeWish(items) {
    try { localStorage.setItem(WISH_KEY, JSON.stringify(items)); } catch (e) { /* private mode */ }
    updateWishCount();
  }
  const isWished = (slug) => readWish().indexOf(slug) !== -1;
  function addToWish(slug) { const w = readWish(); if (w.indexOf(slug) === -1) { w.push(slug); writeWish(w); } }
  function removeFromWish(slug) { writeWish(readWish().filter((s) => s !== slug)); }
  function toggleWish(slug) { const on = isWished(slug); if (on) removeFromWish(slug); else addToWish(slug); return !on; }
  const wishCount = () => readWish().length;

  // 하트 버튼 마크업 (card 형제 / pdp 변형). 상태는 updateWishCount가 동기화.
  const WISH_PATH = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
  function wishBtn(slug, variant) {
    const on = isWished(slug);
    const cls = 'wish-btn' + (variant ? ' wish-btn--' + variant : '') + (on ? ' is-wished' : '');
    const text = variant === 'pdp' ? '<span class="wish-btn-text">위시리스트</span>' : '';
    return `<button type="button" class="${cls}" data-slug="${slug}" aria-pressed="${on ? 'true' : 'false'}" aria-label="${on ? '찜 해제' : '찜하기'}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${WISH_PATH}"/></svg>${text}
    </button>`;
  }
  // 배지 + 모든 하트 버튼 상태 동기화 (로드/토글 시)
  function updateWishCount() {
    const n = wishCount();
    document.querySelectorAll('[data-wish-count]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    document.querySelectorAll('.wish-btn[data-slug]').forEach((btn) => {
      const on = isWished(btn.dataset.slug);
      btn.classList.toggle('is-wished', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? '찜 해제' : '찜하기');
    });
  }
  // 위시리스트 전용 페이지 렌더 (찜한 제품만 card()로). 비었으면 #wishEmpty 노출
  function renderWishlist() {
    const grid = document.getElementById('wishGrid');
    if (!grid) return;
    const empty = document.getElementById('wishEmpty');
    const items = readWish().map(get).filter(Boolean);
    if (!items.length) {
      grid.innerHTML = '';
      grid.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    grid.hidden = false;
    if (empty) empty.hidden = true;
    grid.innerHTML = items.map(card).join('');
  }

  // 위임 핸들러 (하트 = 카드 링크 형제지만 안전하게 기본동작/전파 차단)
  function initWishToggle() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.wish-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const slug = btn.dataset.slug;
      if (!slug) return;
      const nowOn = toggleWish(slug); // writeWish → updateWishCount가 전 버튼 동기화
      const name = (get(slug) || {}).name || '';
      toast(nowOn ? `${name} 위시리스트에 담았어요.` : `${name} 위시리스트에서 뺐어요.`);
      // 위시 페이지에서 해제 시 해당 카드 즉시 사라지게(빈 상태 전환 포함)
      if (document.getElementById('wishGrid')) renderWishlist();
    });
  }

  /* ---------- 메타 동적 갱신 (OG/Twitter) ---------- */
  function setMeta(selector, val) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', val);
  }

  /* ---------- 향 찾기 미니 퀴즈 (scent-finder.html) ---------- */
  // 제품별 무드/상황 태그 (가벼운 점수 매핑용)
  const SCENT_ATTR = {
    'fig-pear':      { mood: 'fresh', occ: ['day', 'evening'] },
    'peach-blossom': { mood: 'sweet', occ: ['day', 'home'] },
    'black-cherry':  { mood: 'dark',  occ: ['evening'] },
    'orchard':       { mood: 'fresh', occ: ['day', 'home'] },
    'pear-blossom':  { mood: 'fresh', occ: ['home', 'day'] },
    'peach-silk':    { mood: 'sweet', occ: ['home'] },
    'honey-fig':     { mood: 'sweet', occ: ['home', 'day'] },
    'cherry-glow':   { mood: 'dark',  occ: ['evening', 'day'] },
  };
  const QUIZ = [
    { key: 'mood', q: '지금 어떤 향에 끌리나요?', opts: [
      { v: 'fresh', label: '싱그럽고 가벼운' },
      { v: 'sweet', label: '달콤하고 포근한' },
      { v: 'dark',  label: '어둡고 관능적인' },
    ] },
    { key: 'occ', q: '언제 쓰고 싶나요?', opts: [
      { v: 'day',     label: '낮 외출' },
      { v: 'evening', label: '저녁 약속' },
      { v: 'home',    label: '집에서' },
    ] },
    { key: 'type', q: '어떤 타입이 좋아요?', opts: [
      { v: 'eau-de-parfum', label: '향수 (Eau de Parfum)' },
      { v: 'body-oil',      label: '바디 오일' },
      { v: 'lip-balm',      label: '립밤' },
    ] },
  ];
  function initScentFinder() {
    const root = document.getElementById('scentFinder');
    if (!root) return;
    const answers = {};
    let step = 0;

    function score() {
      let best = PRODUCTS[0], bestScore = -1;
      PRODUCTS.forEach((p) => {
        const a = SCENT_ATTR[p.slug] || {};
        let s = 0;
        if (answers.type && p.category === answers.type) s += 3;
        if (answers.mood && a.mood === answers.mood) s += 2;
        if (answers.occ && a.occ && a.occ.indexOf(answers.occ) !== -1) s += 1;
        if (s > bestScore) { bestScore = s; best = p; }
      });
      return best;
    }

    function renderQuestion() {
      const Q = QUIZ[step];
      root.innerHTML = `
        <div class="sf-quiz" role="group" aria-label="질문 ${step + 1} / ${QUIZ.length}">
          <p class="sf-progress">${step + 1} <span aria-hidden="true">/</span> ${QUIZ.length}</p>
          <h2 class="sf-question">${Q.q}</h2>
          <div class="sf-options">
            ${Q.opts.map((o) => `<button type="button" class="sf-option" data-val="${o.v}">${o.label}</button>`).join('')}
          </div>
          ${step > 0 ? '<button type="button" class="sf-back" data-back>← 이전 질문</button>' : ''}
        </div>`;
      const first = root.querySelector('.sf-option');
      if (first) first.focus();
    }

    function renderResult() {
      const p = score();
      document.title = `당신의 향 · ${p.name} — RIPE`;
      root.innerHTML = `
        <div class="sf-result">
          <p class="sf-result-eyebrow">당신에게 어울리는 향</p>
          <article class="sf-card">
            <a class="sf-card-media media" href="${productHref(p.slug)}" aria-label="${p.name} 상세 보기">
              <img src="${imgSrc(p.slug, 'hover')}" srcset="${imgSrcset(p.slug, 'hover')}" sizes="(max-width: 600px) 100vw, 360px"
                   alt="${p.name} ${p.type}" width="1254" height="1254" decoding="async" />
            </a>
            <div class="sf-card-body">
              <h2 class="sf-card-name">${p.name}</h2>
              <p class="sf-card-type">${p.type}</p>
              <p class="sf-card-desc">${p.desc}</p>
              <p class="sf-card-price">${price(p.price)}</p>
              <div class="sf-card-actions">
                <button type="button" class="btn btn-fill sf-add" data-slug="${p.slug}">ADD TO CART</button>
                <a class="btn btn-outline" href="${productHref(p.slug)}">상세 보기</a>
              </div>
            </div>
          </article>
          <button type="button" class="sf-restart" data-restart>다시 하기</button>
        </div>`;
    }

    root.addEventListener('click', (e) => {
      const opt = e.target.closest('.sf-option');
      if (opt) {
        answers[QUIZ[step].key] = opt.dataset.val;
        step += 1;
        (step < QUIZ.length ? renderQuestion : renderResult)();
        return;
      }
      if (e.target.closest('[data-back]')) { step = Math.max(0, step - 1); renderQuestion(); return; }
      if (e.target.closest('[data-restart]')) {
        step = 0;
        Object.keys(answers).forEach((k) => delete answers[k]);
        document.title = '향 찾기 — RIPE';
        renderQuestion();
        return;
      }
      const add = e.target.closest('.sf-add');
      if (add) { addToCart(add.dataset.slug, 1); toast(`${(get(add.dataset.slug) || {}).name || ''} 장바구니에 담겼습니다.`); }
    });

    renderQuestion();
  }

  /* ---------- 서브페이지: 데모 폼 / 체크아웃 (정적) ---------- */
  function initDemoForms() {
    document.querySelectorAll('form[data-demo]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        toast(form.getAttribute('data-toast') || '접수되었습니다. 감사합니다.');
        if (form.dataset.reset !== 'false') form.reset();
      });
    });
    const checkout = document.getElementById('checkoutBtn');
    if (checkout) checkout.addEventListener('click', () => toast('데모 주문입니다. 실제 결제는 진행되지 않습니다.'));
  }

  /* ---------- 서브페이지: JOURNAL (목록 + 글) ---------- */
  const JOURNAL = [
    {
      id: 1, cat: 'Guide', title: '젖은 피부에 향을 올리는 법', date: '2025.04.11',
      excerpt: '샤워 직후, 물기가 채 마르기 전이 향이 가장 오래 머무는 순간이다.',
      img: lifeEntry('lifestyle-bath-fig-pear', '욕실에서 RIPE Fig & Pear와 함께한 순간'),
      body: [
        '향수는 피부 위에서 완성된다. 같은 향이라도 건조한 피부에서는 빠르게 날아가고, 물기를 머금은 피부에서는 훨씬 오래 머문다. 샤워 직후 수건으로 가볍게 눌러 물기를 덜어낸 피부가 가장 좋은 캔버스다.',
        '이유는 단순하다. 촉촉한 피부는 향 분자를 더 천천히 붙잡아 둔다. 수분이 일종의 매개가 되어, 향이 공기 중으로 흩어지기 전에 피부 안쪽으로 스며들 시간을 벌어준다.',
        '손목과 목 안쪽, 쇄골처럼 맥이 뛰는 자리에 한두 번. 문지르지 말고 그대로 두는 편이 좋다. 비비는 순간 향의 윗부분이 부서지며 균형이 무너진다.',
        '바디 오일을 먼저 바르고 그 위에 같은 계열의 향수를 올리면, 잔향은 더 길게 이어진다. 젖은 피부에서 시작된 향은, 하루의 끝까지 천천히 당신을 따라온다.',
      ],
    },
    {
      id: 2, cat: 'Essay', title: '과일이 가장 향기로운 순간', date: '2025.02.28',
      excerpt: '완전히 익었지만 아직 떨어지지 않은 — 그 사이의 하루를 우리는 좋아한다.',
      img: { slug: 'fig-pear', role: 'hover' },
      body: [
        '과일을 오래 들여다본 적이 있다. 단단한 풋과일은 향이 없다. 너무 익어 무른 과일은 향이 무너진다. 그 사이, 완전히 익었지만 아직 떨어지지 않은 단 하루 — 우리는 그 하루를 좋아한다.',
        '그 순간의 향에는 긴장이 있다. 달콤함이 정점에 달했지만 아직 부패로 기울지 않은, 아슬아슬한 균형. 무화과의 그늘진 단내, 복숭아의 솜털 아래 흐르는 과즙, 빗물을 머금은 배의 서늘함이 모두 그 하루에 들어 있다.',
        'RIPE의 모든 향은 그 하루에서 출발한다. 우리는 과일을 예쁘게 다듬는 대신, 가장 감각적인 순간의 날것을 옮기려 한다. 그래서 향이 조금 무겁고, 조금 어둡고, 오래 남는다.',
        '잘 익은 것들의 시간은 길지 않다. 향으로 옮겨두면, 그 짧은 절정은 피부 위에서 다시 한 번 천천히 흐른다.',
      ],
    },
    {
      id: 3, cat: 'Season', title: '여름 피부를 위한 향 고르기', date: '2025.06.03',
      excerpt: '더울수록 향은 가벼워야 한다는 생각은 절반만 맞다.',
      img: lifeEntry('lifestyle-vanity-fig-pear', 'RIPE 향수가 놓인 화장대'),
      body: [
        '더울수록 향은 가벼워야 한다는 말은 절반만 맞다. 여름엔 체온이 높아 향이 빠르게 피어오른다. 그래서 진한 향은 더 진해지고, 가벼운 향은 한낮에 금세 사라진다.',
        '관건은 농도가 아니라 결이다. 무겁더라도 투명한 향, 살갗에 붙어 은은하게 퍼지는 향이 여름에 어울린다. 시트러스의 날카로움보다, 젖은 과일의 둥근 단내가 땀과 섞였을 때 더 자연스럽다.',
        '낮에는 바디 오일로 베이스를 깔고, 저녁에 같은 계열의 오 드 파르팽을 덧올리는 방법을 권한다. 한낮의 열기에 향을 다 소진하지 않고, 하루를 길게 쓸 수 있다.',
        '여름의 향은 결국 피부의 향이다. 가장 잘 어울리는 건, 당신의 체온과 다투지 않는 향이다.',
      ],
    },
    {
      id: 4, cat: 'Fragrance', title: '바디 오일과 향수를 레이어드하는 방법', date: '2024.11.15',
      excerpt: '같은 계열의 향을 겹치면, 향이 피부에 더 깊이 자리를 잡는다.',
      img: { slug: 'orchard', role: 'hover' },
      body: [
        '하나의 향을 더 깊게 만드는 가장 쉬운 방법은, 같은 향을 두 번 입는 것이다. 바디 오일과 향수를 같은 계열로 겹치면, 향은 피부 표면이 아니라 그 아래에 자리를 잡는다.',
        '순서가 있다. 샤워 직후 젖은 피부에 바디 오일을 펴 바르고, 흡수된 뒤 향수를 올린다. 오일이 만든 막이 향을 천천히 풀어주는 저장고가 된다.',
        '다른 계열을 섞고 싶다면, 한쪽을 베이스로 낮게 깔고 다른 한쪽을 포인트로 가볍게 얹는 편이 안전하다. 두 향이 같은 자리에서 정면으로 부딪치면 균형이 깨진다.',
        '레이어드는 향을 더하는 일이 아니라, 향이 머무는 시간을 늘리는 일이다. 깊이는 양이 아니라 지속에서 온다.',
      ],
    },
    {
      id: 5, cat: 'Skin', title: '향을 오래 유지하는 피부 습관', date: '2024.09.07',
      excerpt: '향수는 피부 상태에 따라 전혀 다르게 발현된다.',
      img: lifeEntry('lifestyle-hand-label-fig-pear', '손에 든 RIPE Fig & Pear'),
      body: [
        '같은 향수를 뿌려도 어떤 날은 오래 가고 어떤 날은 금세 사라진다. 차이는 향이 아니라 피부에 있다. 건조한 피부는 향을 붙잡을 자리가 없다.',
        '평소 보습이 가장 큰 변수다. 수분과 유분이 채워진 피부는 향 분자를 더 오래 머금는다. 향수를 쓰기 전, 무향 보습제나 같은 계열의 바디 오일로 피부를 먼저 준비해 두자.',
        '각질이 쌓인 자리에서는 향이 탁해진다. 주기적인 부드러운 각질 정리는 향의 발현을 맑게 한다. 다만 자극이 된 직후의 피부에는 향을 올리지 않는 편이 좋다.',
        '결국 향을 오래 입는 일은 피부를 잘 돌보는 일과 같다. 좋은 잔향은 좋은 피부 위에서만 길게 남는다.',
      ],
    },
    {
      id: 6, cat: 'Everyday', title: '아무것도 하지 않는 오후의 향', date: '2024.07.22',
      excerpt: '일정 없이 비워둔 오후, 창가에서 복숭아 향이 천천히 번진다.',
      img: { slug: 'peach-blossom', role: 'hover' },
      body: [
        '일정 없이 비워둔 오후가 있다. 할 일이 없다는 건 조금 불안하지만, 그 불안이 가라앉고 나면 감각이 천천히 깨어난다. 창으로 든 햇빛, 식어가는 차, 그리고 어디선가 번지는 과일 향.',
        '그런 날엔 향수를 뿌리지 않아도 된다. 손목에 바디 오일 한 방울이면 충분하다. 움직임이 적은 하루에는, 향도 굳이 멀리 갈 필요가 없다.',
        '복숭아의 단내가 손등에서 올라와 책장을 넘기는 손끝에 머문다. 향은 사건을 만들지 않는다. 다만 비어 있는 시간을 조용히 채운다.',
        '아무것도 하지 않는 오후의 향은, 가장 사적인 향이다. 누구에게 보이기 위한 것이 아니라, 오직 나를 위한 잔향.',
      ],
    },
  ];
  const getArticle = (id) => JOURNAL.find((a) => a.id === id);

  // img 정규화: 제품 {slug,role} 또는 에디토리얼 {src,srcset,alt,w,h} 모두 처리
  function imgData(im, fallbackAlt) {
    if (im && im.slug) {
      return { src: imgSrc(im.slug, im.role), srcset: imgSrcset(im.slug, im.role), alt: fallbackAlt, w: 1254, h: 1254 };
    }
    return { src: im.src, srcset: im.srcset, alt: im.alt || fallbackAlt, w: im.w || 1254, h: im.h || 1254 };
  }

  function journalThumb(a, sizes) {
    const d = imgData(a.img, a.title);
    return `<span class="journal-thumb media"><img src="${d.src}" srcset="${d.srcset}" sizes="${sizes}"
      alt="${d.alt}" width="${d.w}" height="${d.h}" loading="lazy" decoding="async" /></span>`;
  }
  function journalCard(a, withExcerpt) {
    return `<li><a class="journal-card" href="journal-article.html?id=${a.id}">
      ${journalThumb(a, '(max-width:600px) 100vw, (max-width:980px) 50vw, 33vw')}
      <span class="journal-meta"><span class="journal-tag">${a.cat}</span><span class="journal-date">${a.date}</span></span>
      <h3 class="journal-title">${a.title}</h3>
      ${withExcerpt ? `<p class="journal-excerpt">${a.excerpt}</p>` : ''}
    </a></li>`;
  }
  function renderJournalList(el) {
    el.innerHTML = JOURNAL.map((a) => journalCard(a, true)).join('');
  }
  function renderArticle() {
    const root = document.getElementById('articleRoot');
    if (!root) return;
    const id = parseInt(getParam('id', '1'), 10);
    const a = getArticle(id) || JOURNAL[0];

    document.title = `${a.title} — RIPE JOURNAL`;
    const crumb = document.getElementById('articleCrumb');
    if (crumb) crumb.textContent = a.title;

    const d = imgData(a.img, a.title);

    // 동적 OG/Twitter (글 제목·발췌·대표 이미지)
    const aTitle = `${a.title} — RIPE JOURNAL`;
    setMeta('meta[property="og:title"]', aTitle);
    setMeta('meta[name="twitter:title"]', aTitle);
    setMeta('meta[property="og:description"]', a.excerpt);
    setMeta('meta[name="twitter:description"]', a.excerpt);
    setMeta('meta[property="og:image"]', d.src);
    setMeta('meta[name="twitter:image"]', d.src);
    const portrait = d.h > d.w; // 세로(라이프스타일) → 4:5 figure, 정사각/가로 → 16:9
    const figClass = portrait ? 'article-figure article-figure--portrait media' : 'article-figure media';
    const figSizes = portrait ? '(max-width:560px) 100vw, 520px' : '(max-width:980px) 100vw, 760px';
    const fig = `<figure class="${figClass}"><img src="${d.src}" srcset="${d.srcset}"
         sizes="${figSizes}" alt="${d.alt}" width="${d.w}" height="${d.h}" fetchpriority="high" decoding="async" /></figure>`;

    root.innerHTML = `
      <header class="article-head">
        <p class="article-tag">${a.cat}</p>
        <h1 class="article-title">${a.title}</h1>
        <p class="article-date">${a.date}</p>
      </header>
      ${fig}
      <div class="article-body measure">${a.body.map((p) => `<p>${p}</p>`).join('')}</div>`;

    const recEl = document.getElementById('articleRecommend');
    if (recEl) {
      recEl.innerHTML = JOURNAL.filter((x) => x.id !== a.id).slice(0, 2).map((r) => journalCard(r, false)).join('');
    }
  }

  // 가벼운 토스트(담겼습니다 안내)
  function toast(msg) {
    let t = document.getElementById('ripeToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ripeToast';
      t.className = 'toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('is-show'), 2200);
  }

  /* ---------- 3. 헤더 드로어 ---------- */
  function initDrawer() {
    const toggle = document.getElementById('menuToggle');
    const drawer = document.getElementById('navDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const closeBtn = document.getElementById('drawerClose');
    if (!toggle || !drawer || !overlay) return;
    drawer.inert = true; // 닫힘 상태에서 탭 포커스 누수 차단

    let lastFocused = null;
    const focusables = () =>
      drawer.querySelectorAll('a[href], button:not([disabled])');

    function open() {
      lastFocused = document.activeElement;
      overlay.hidden = false;
      // reflow 후 클래스 → 트랜지션 보장
      requestAnimationFrame(() => {
        overlay.classList.add('is-open');
        drawer.classList.add('is-open');
      });
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '메뉴 닫기');
      drawer.setAttribute('aria-hidden', 'false');
      drawer.inert = false;
      document.body.style.overflow = 'hidden';
      const first = focusables()[0];
      if (first) first.focus();
    }

    function close() {
      overlay.classList.remove('is-open');
      drawer.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.inert = true;
      document.body.style.overflow = '';
      const onEnd = () => { overlay.hidden = true; };
      drawer.addEventListener('transitionend', onEnd, { once: true });
      if (lastFocused) lastFocused.focus();
    }

    const isOpen = () => drawer.classList.contains('is-open');

    toggle.addEventListener('click', () => (isOpen() ? close() : open()));
    overlay.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    drawer.querySelectorAll('.drawer-nav a, .drawer-foot a')
      .forEach((a) => a.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        // 간단한 포커스 트랩
        const f = Array.from(focusables());
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ---------- 부트 ---------- */
  function init() {
    const $ = (id) => document.getElementById(id);
    if ($('bestGrid'))     renderCards($('bestGrid'), ['fig-pear', 'peach-blossom', 'orchard', 'honey-fig']);
    if ($('featuredList')) renderFeatured($('featuredList'), ['fig-pear', 'orchard']);
    if ($('selectionGrid'))renderSelection($('selectionGrid'));
    if ($('instaStrip'))   renderInsta($('instaStrip'));
    // 서브페이지 (전부 엘리먼트 가드 — 다른 페이지에서 무해)
    if ($('shopGrid')) { renderShop($('shopGrid')); initShopFilter($('shopGrid')); }
    renderProduct();
    if ($('journalGrid')) renderJournalList($('journalGrid'));
    renderArticle();
    renderCart();
    updateCartCount();
    if ($('wishGrid')) renderWishlist();
    if ($('scentFinder')) initScentFinder();
    initWishToggle();
    updateWishCount();   // 배지 + 모든 하트 버튼 초기 상태 동기화
    initDemoForms();
    initDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 데이터/헬퍼 노출(모션·서브페이지·2차 카트 연동용)
  window.RIPE = {
    PRODUCTS, CATEGORY_META, JOURNAL, get, getArticle, byCategory,
    imgSrc, imgSrcset, price,
    productHref, shopCatHref, getParam,
    addToCart, removeFromCart, readCart, cartCount,
    addToWish, removeFromWish, toggleWish, isWished, readWish, wishCount,
  };
})();
