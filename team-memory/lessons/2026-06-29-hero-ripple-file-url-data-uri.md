# 회고 — RIPE 히어로 물찰랑 file:// 복구

> 우리팀의 *성장 기록*. 큰 작업/프로젝트 끝에 team-lead 주도로 작성.
> 채택된 내용은 이 `jiwon-harness` 레포 `team-memory/`로 **PR해서** 다음 프로젝트로 가지고 간다.

- 날짜: 2026-06-29
- 프로젝트: RIPE (향수 브랜드 사이트 + 카페24 스킨)
- 참여 팀원: team-lead / developer / perf-engineer / motion-engineer  (designer·ideator 미참여)
- 한 줄 요약: 메인 히어로 워터 리플이 `file://` 더블클릭에서 죽던 버그를, 텍스처를 base64 data URI로 인라인해 복구하고 메인↔카페24 세기를 통일.

---

## 1. 잘 굴러간 패턴 (Keep)
*다음에도 똑같이 할 것*

- **"같은데 하나만 죽는다"에서 차이로 원인 좁히기**: 카페24는 멀쩡하고 메인만 리플이 죽음 → "data URI vs 파일경로 텍스처" 차이로 범위를 좁혀 분담을 건 게 적중. (team-lead)
- **무거운 인라인 에셋은 perf 게이트를 구현 *전에* 통과**: data URI는 용량이 곧 문서 무게라 회귀 리스크가 인라인하는 순간 발생 → perf-engineer를 구현과 병렬로 먼저 붙여 207KB→~88KB, 모바일 비차단까지 선점. (perf-engineer)
- **원인-처방 1:1 구현**: data URI 인라인(원인 제거) + 데스크탑 전용 `<link media>` 분리(모바일 비용 차단) + 미사용 1672w srcset 제거(이중 다운로드 상쇄)를 한 묶음으로. (developer)

## 2. 잘못 굴러간 패턴 (Drop)
*다시는 이렇게 하지 말 것*

- **data URI를 `style.css`에 바로 박기**: 동작은 맞지만 렌더차단 CSS라 리플을 안 쓰는 모바일(`.hero-ripple{display:none}`)까지 64~88KB를 전부 전송하는 회귀 → perf 게이트에서 반려됨. 처음부터 별도 시트로 갔어야.
- **풀해상도 디폴트 인라인(카페24 207KB)**: 굴절+스크림 뒤에 깔리는 텍스처에 1672w 풀파일은 과스펙. 실제 표시 사이즈(1200px)로 캡해야.
- **http로만 검증하고 "완료"라 부르기**: 도구가 `file://` 내비를 막아 실작동은 http로만 봄. file://는 카페24와 동일 메커니즘이라 논리적으론 보장되나, "완료"가 아니라 "사용자 file:// 확인 대기"로 닫는 게 정확.

## 3. 새로 배운 패턴 (Try)
*다음 프로젝트에서 시도해볼 것*

- **분담 순서: 게이트(perf)·튜닝(motion) 병렬 → 구현(developer) → 점검(team-lead)**. 서로 다른 파일을 만지게 분할하면 충돌 없이 병렬 가능했음. 인라인/용량이 걸린 작업의 기본 진형으로.

## 4. 도메인 지식 (Domain)
*이 영역에서 알게 된 것 — 다른 프로젝트에도 통할 수 있음*

- **`file://` + WebGL/canvas 텍스처 = data URI 인라인이 디폴트.** `gl.texImage2D`·canvas `drawImage`+`getImageData` 등으로 이미지를 GPU/픽셀로 올리는 모든 효과(jquery.ripples, three.js 텍스처 등)는 `file://`에서 외부 경로 이미지가 cross-origin으로 **taint**되어 `onload` 안에서 throw→폴백된다. 서버 없이 더블클릭으로 여는 배포(카페24 스킨 등)면 그 소스 이미지를 **base64 data URI로 인라인**하면 same-origin 취급되어 taint가 사라진다.
- **미매칭 `@media`도 같은 파일 안이면 바이트는 전송된다.** `@media`는 "적용 여부"만 가르고 "전송 여부"는 못 막는다. 조건부 무거운 에셋의 전송 자체를 끊으려면 **별도 스타일시트 + `<link media="(min-width:861px)">`** 로 분리해야 한다(미매칭 link는 비차단·저우선순위). (perf-engineer)
- **물찰랑 세기 튜닝의 두 축은 반대로 움직인다.** `perturbance`↑ = 더 과하지만 유리구슬·렌즈처럼 인공적 / ↓ = 덜 세지만 더 물 같고 자연스러움 — '과하게'와 '물 같게'는 트레이드오프다. 그리고 체감 통일은 perturbance 한 값이 아니라 **drop 진폭 3값(mousemove/initial/auto)까지 한 세트**로 맞춰야 일관된다. (motion-engineer)
- **인라인 `<script defer>`는 무시된다.** `defer`는 외부(`src`) 스크립트에만 적용 → 인라인 초기화 코드가 deferred jQuery보다 먼저 실행돼 죽었음. 인라인은 `DOMContentLoaded`로 감싼다. (이번 카페24 1차 수정)

---

## 5. 본체로 옮길 항목
*이 중 어느 항목을 `jiwon-harness` 레포에 PR할 것인가 — team-lead가 [x] 표시*

- [x] (4-1번) `file://` + WebGL/canvas 텍스처 → data URI 인라인 → `team-memory/domain/webgl-file-url-texture.md` (랜딩/히어로 비주얼 도메인 재사용가 높음)
- [x] (4-2번) 조건부 무거운 에셋은 `@media` 블록이 아니라 `<link media>`로 분리 → `team-memory/domain/conditional-asset-loading.md`
- [x] (4-3번) 리플 세기 = perturbance + drop 진폭 3값 한 세트 / 과함↔물같음 트레이드오프 → `team-memory/domain/water-ripple-tuning.md`
- [ ] (3번 분담 진형) → 필요 시 `team-memory/patterns/inline-asset-gate-flow.md`

> 옮길 때 한 줄 명시: *어느 파일에 / 어떤 룰로*. 충돌하는 기존 지식 없음(team-memory 최초 적재).

---

## 팀원별 한 줄

- 🟣 team-lead: 카페24는 멀쩡한데 메인만 죽는 차이에서 "data URI vs 파일경로"로 원인을 좁혀 분담을 건 판단은 맞았다 — 단 file:// 실작동은 사용자 확인 대기로 닫는다.
- 🩷 designer: (미참여 — 배경 이미지·레이아웃·시각 방향 불변)
- 🔵 developer: "리플 안 켜짐"이 아니라 "WebGL 텍스처 업로드가 file:// taint로 onload 내부에서 throw→폴백"까지 좁힌 게 핵심. data URI 인라인 + 데스크탑 전용 시트 분리 + 미사용 srcset 제거는 다음에도 한 세트로 가져갈 위생 처리.
- 🩵 motion-engineer: 세기를 perturbance 단일값이 아니라 drop 진폭 3값까지 한 세트로 묶어 메인↔카페24 체감을 실제로 일치시켰다.
- 🟢 perf-engineer: 인라인은 용량이 곧 본문 무게 — 1200px/~88KB 다운스펙 + `<link media>` 분리 + 1672w 제거로 모바일 바이트 0 전송·데스크탑 이중 다운로드 상쇄 달성.
- 🟠 ideator: (미참여)
