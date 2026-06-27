/* =========================================================
   RIPE — hero-ripple.js
   역할: 히어로 워터 리플 효과 (jquery.ripples, MIT)
   - 데스크탑 전용 (≤768px 비활성, CSS로도 ≤860 display:none)
   - prefers-reduced-motion: 완전 비활성
   - WebGL 미지원 / 초기화 실패 시: try/catch graceful fallback
     (정적 배경 CSS가 자동으로 표시됨 — 화면 깨짐 없음)
   - 페이지 visibility 변경 시 pause/resume (배터리·성능 배려)
   - jQuery.noConflict() 로 전역 $ 격리 (다른 코드 충돌 방지)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. 조기 반환 조건 ---------- */

  /* prefers-reduced-motion: 리플 완전 비활성 */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* 모바일(≤768px): 터치 환경 + GPU 부담으로 비활성
     CSS (≤860px) 에서도 display:none 처리하므로 이중 안전장치 */
  if (window.innerWidth <= 768) return;

  /* jQuery / jquery.ripples 미로드 시 조용히 종료 */
  if (typeof jQuery === 'undefined') {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined') console.warn('RIPE hero-ripple: jQuery 미로드');
    return;
  }

  /* ---------- 2. jQuery 격리 ----------
     $ 전역은 복원, 이 파일 내부에서만 jQ 참조 사용 */
  var jQ = jQuery.noConflict();

  /* ---------- 3. 리플 초기화 ---------- */
  jQ(function () {
    var $ripple = jQ('.hero-ripple');
    if (!$ripple.length) return;

    var autoDropTimer = null;
    var isDestroyed = false;

    try {
      $ripple.ripples({
        resolution:   512,   /* WebGL 해상도 — 256~512 권장 (성능·품질 균형) */
        dropRadius:   26,    /* 물방울 반지름(px) — 마우스 물결 크기 */
        perturbance:  0.04,  /* 굴절 강도 — 한 단계 더 은은하게 */
        interactive:  true,  /* 마우스/터치 상호작용 */
      });

      /* 로드 직후 잔물결 몇 방울 — 처음부터 물기가 느껴지게(과하지 않게) */
      (function initialDrops() {
        var w = $ripple.outerWidth(), h = $ripple.outerHeight();
        for (var i = 0; i < 4; i++) {
          (function (d) {
            setTimeout(function () {
              try { $ripple.ripples('drop', w * (0.18 + Math.random() * 0.64), h * (0.18 + Math.random() * 0.64), 28, 0.055); } catch (e) {}
            }, 300 + d * 300);
          })(i);
        }
      })();

      /* ---------- 자동 잔물결: 2~5초 간격으로 랜덤 위치에 아주 약하게 ---------- */
      function drop() {
        if (isDestroyed) return;
        var w = $ripple.outerWidth();
        var h = $ripple.outerHeight();
        /* 한 틱에 1방울 — 가만히 있을 땐 잔잔하게 */
        var x = w * 0.1 + Math.random() * w * 0.8;
        var y = h * 0.1 + Math.random() * h * 0.8;
        try { $ripple.ripples('drop', x, y, 24, 0.026); } catch (e) { /* 무시 */ }
        scheduleDrop();
      }

      function scheduleDrop() {
        if (isDestroyed) return;
        /* 1.8~3.6s 간격 — 더 은은한 잔물결(마우스 움직임이 메인) */
        var delay = 1800 + Math.random() * 1800;
        autoDropTimer = setTimeout(drop, delay);
      }

      scheduleDrop();

      /* ---------- 페이지 visibility 변경: pause/resume ----------
         백그라운드 탭에서 GPU 낭비 방지 */
      document.addEventListener('visibilitychange', function () {
        if (isDestroyed) return;
        if (document.hidden) {
          clearTimeout(autoDropTimer);
          try { $ripple.ripples('pause'); } catch (e) { /* 무시 */ }
        } else {
          try { $ripple.ripples('play'); } catch (e) { /* 무시 */ }
          scheduleDrop();
        }
      });

      /* ---------- 스크롤 중 WebGL 렌더 일시정지(성능) ----------
         스크롤 중에는 물결 시뮬레이션을 멈춰 GPU 부하를 줄이고,
         스크롤이 멎으면 180ms 후 재개. (히어로 sticky 구간 jank 완화) */
      var scrollPauseTimer = null;
      var scrollPaused = false;
      window.addEventListener('scroll', function () {
        if (isDestroyed) return;
        if (!scrollPaused) {
          scrollPaused = true;
          clearTimeout(autoDropTimer);
          try { $ripple.ripples('pause'); } catch (e) { /* 무시 */ }
        }
        clearTimeout(scrollPauseTimer);
        scrollPauseTimer = setTimeout(function () {
          scrollPaused = false;
          if (isDestroyed || document.hidden) return;
          try { $ripple.ripples('play'); } catch (e) { /* 무시 */ }
          scheduleDrop();
        }, 180);
      }, { passive: true });

      /* ---------- 리사이즈: 모바일로 전환 시 리플 정리 ---------- */
      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (window.innerWidth <= 768 && !isDestroyed) {
            clearTimeout(autoDropTimer);
            isDestroyed = true;
            try { $ripple.ripples('destroy'); } catch (e) { /* 무시 */ }
          }
        }, 300);
      }, { passive: true });

    } catch (e) {
      /* WebGL 미지원 / 초기화 실패 — CSS background-image(정적)로 graceful fallback
         hero-ripple div 의 배경이 그대로 보임, 레이아웃 깨짐 없음 */
      if (typeof console !== 'undefined') {
        console.warn('RIPE hero-ripple: WebGL 초기화 실패, 정적 배경으로 폴백', e.message || e);
      }
    }
  });

})();
