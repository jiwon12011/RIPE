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
        resolution:   256,   /* WebGL 해상도 — 256이면 시뮬 비용 1/4, 이 은은한 굴절엔 시각차 없음 */
        dropRadius:   30,    /* 물방울 반지름(px) — 마우스 물결 크기 */
        perturbance:  0.025, /* 굴절 강도 — 카페24와 동일(부드러운 물 같은 잔물결) */
        interactive:  false, /* 내장 mousemove drop 비활성 — 아래 RAF 스로틀로 대체(jank 방지) */
      });

      /* ---------- 마우스 상호작용: RAF 스로틀 ----------
         interactive:true 는 mousemove마다 동기 WebGL draw call을 실행해
         빠르게 움직이면 프레임당 2~4개가 쌓여 jank가 난다. 한 프레임에 1 drop만
         실행하도록 requestAnimationFrame으로 묶는다. (가드: 파괴/스크롤/탭) */
      var moveDropRAF = null;
      $ripple[0].addEventListener('mousemove', function (e) {
        if (scrollPaused || isDestroyed || document.hidden) return; /* 스크롤 중/파괴/숨김이면 즉시 반환(불필요 작업 차단) */
        if (moveDropRAF !== null) return;            /* 이번 프레임 이미 예약됨 */
        var rect = $ripple[0].getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        moveDropRAF = requestAnimationFrame(function () {
          moveDropRAF = null;
          if (isDestroyed || scrollPaused || document.hidden) return;
          try { $ripple.ripples('drop', mx, my, 30, 0.022); } catch (ex) { /* 무시 */ } /* 진폭 — 카페24와 동일(물 같은 잔물결) */
        });
      }, { passive: true });

      /* 로드 직후 잔물결 몇 방울 — 처음부터 물기가 느껴지게(과하지 않게) */
      (function initialDrops() {
        var w = $ripple.outerWidth(), h = $ripple.outerHeight();
        for (var i = 0; i < 4; i++) {
          (function (d) {
            setTimeout(function () {
              try { $ripple.ripples('drop', w * (0.18 + Math.random() * 0.64), h * (0.18 + Math.random() * 0.64), 28, 0.032); } catch (e) {} /* 로드 직후 진폭 — 카페24와 동일(물 같은 잔물결) */
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
        try { $ripple.ripples('drop', x, y, 26, 0.018); } catch (e) { /* 무시 */ } /* 자동 잔물결 진폭 — 카페24와 동일(물 같은 잔물결) */
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

      /* ---------- 스크롤 중 물방울만 정지(렌더 루프는 유지) ----------
         주의: 스크롤 중 ripples('pause')로 RAF 루프를 끄면, Apple Silicon GPU가
         180ms 무활동 뒤 절전(power-gate)되고 스크롤이 멎어 play() 할 때 GPU 웜업
         stall이 끊김(jank)으로 나타난다. 실제 트랙패드 스크롤의 미세 멈춤마다 반복됨.
         → RAF 루프는 계속 돌려 GPU를 웜 상태로 유지(resolution:256, ~0.2ms/frame로 저렴).
           스크롤 중엔 scrollPaused 플래그로 새 물방울(자동·마우스)만 막는다. */
      var scrollPauseTimer = null;
      var scrollPaused = false;
      window.addEventListener('scroll', function () {
        if (isDestroyed) return;
        if (!scrollPaused) {
          scrollPaused = true;
          clearTimeout(autoDropTimer);   /* 자동 잔물결만 중지(pause 호출 안 함) */
        }
        clearTimeout(scrollPauseTimer);
        scrollPauseTimer = setTimeout(function () {
          scrollPaused = false;
          if (isDestroyed || document.hidden) return;
          scheduleDrop();                /* 자동 잔물결 재개(play 불필요 — 루프 유지 중) */
        }, 180);
      }, { passive: true });

      /* 커스텀 mousemove 트레일은 제거함 — 예전 "딱 좋았던" 느낌은
         jquery.ripples 기본 interactive 상호작용에 의존했음. 트레일은
         성격이 과해서 굴절(perturbance)만 살짝 올려 기본 상호작용을 또렷하게 한다. */

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
