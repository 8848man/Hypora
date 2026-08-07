# Hypora API 안내서 (쉬운 설명판)

이 문서는 `app/server/api_spec.md`(개발자용 기술 레퍼런스)를 바탕으로, 처음 보는 사람도
바로 이해할 수 있도록 쉽게 풀어 쓴 한국어 버전입니다. 실제 동작의 기준(정답)은 항상
`app/server/api_spec.md`와 코드이며, 이 문서는 "더 친절하게 읽는 방법"을 제공하는
보조 문서입니다.

## 이 API는 무엇을 하나요?

Hypora 서버에는 AI가 사용자의 작업(캔버스 작성, MVP 기획, 리스크 정리 등)을 도와주는
여러 개의 "비서" 기능이 있습니다. 각 비서는 하나의 API 주소(엔드포인트)로 호출하며,
"이런 정보를 줄 테니, 이런 걸 제안해줘" 라고 요청하면 AI가 답을 만들어 돌려줍니다.

기본 사용법은 항상 같습니다.

1. 요청은 JSON 형식으로 보냅니다. (`Content-Type: application/json`)
2. `/api/health`만 GET이고, 나머지는 전부 POST입니다.
3. 응답도 JSON으로 옵니다.
4. 뭔가 잘못되면 아래 표처럼 상황별로 다른 에러가 옵니다.

## 에러가 나면 어떻게 읽나요?

| 상황 | 응답 코드 | 의미 |
|---|---|---|
| 요청 형식이 잘못됨 (필드 누락, 오타 등) | 400 | 내가 보낸 데이터를 다시 확인해야 함 |
| AI가 응답하는 데 너무 오래 걸림 | 504 | 잠시 후 다시 시도 |
| 요청을 너무 많이 보냄 | 429 | 속도를 늦추고 다시 시도 |
| AI 서비스가 일시적으로 안 됨 | 503 | 잠시 후 다시 시도 |
| AI가 이상한 형식으로 답함 | 502 | 서버 쪽 문제, 재시도해도 될 수 있음 |
| AI가 안전 문제로 답변을 거부함 | 422 | 요청 내용을 다시 검토 |
| 네트워크 문제 | 503 | 잠시 후 다시 시도 |
| 알 수 없는 에러 | 500 | 서버 쪽 문제 |

에러 응답은 항상 이런 모양입니다.

```json
{ "error": "사람이 읽을 수 있는 설명", "kind": "validation" }
```

---

## 1. 서버가 살아있는지 확인하기

**`GET /api/health`**

가장 간단한 확인용 API입니다. AI 연결까지 실제로 테스트해보고, 잘 되면 `ok`를 돌려줍니다.

**응답 예시 (정상)**
```json
{ "status": "ok", "providerId": "gemini" }
```

**응답 예시 (문제 있음)**
```json
{ "status": "error", "providerId": "gemini", "detail": "왜 실패했는지 설명" }
```

---

## 2. 캔버스 도우미 — 사업 모델 캔버스 작성 도와주기

**`POST /api/canvas-assistant`**

사용자가 비즈니스 캔버스(문제 정의, 고객, 가치 제안 등)를 채울 때, 다음 내용을 제안하거나
빠진 부분을 짚어주는 API입니다.

**언제 어떤 `operation`을 쓰나요?**
- `suggestion` — 이 칸에 뭘 써야 할지 제안해줘
- `missingInfo` — 지금까지 쓴 내용 중 빠진 게 뭔지 알려줘
- `followUp` — 이어서 물어볼 질문을 만들어줘
- `refinement` — 이미 쓴 답을 다듬어줘 (이때만 `rationale`이 함께 옴)

**요청 예시**
```json
{
  "operation": "suggestion",
  "canvasContext": [
    { "field": "problem", "value": "소상공인이 재고 관리를 엑셀로만 하고 있음" }
  ],
  "currentField": "solution",
  "language": "ko",
  "projectName": "우리 가게 재고 앱"
}
```

**응답 예시**
```json
{ "suggestionText": "모바일 앱으로 실시간 재고를 관리하는 솔루션을 제안합니다..." }
```

| 필드 | 필수인가요? | 설명 |
|---|---|---|
| `operation` | 예 | 위 4가지 중 하나 |
| `canvasContext` | 예 | 지금까지 캔버스에 채운 내용 목록 |
| `currentField` | 아니오 | 지금 작성 중인 칸 이름 |
| `priorAnswers` | 아니오 | 이전 답변들 |
| `language` | 예 | `ko` 또는 `en` |
| `projectName` | 아니오 | 캔버스가 비어있을 때 참고할 프로젝트 이름 |

---

## 3. 기능 제안 도우미 — 어떤 기능을 만들지 추천

**`POST /api/feature-suggestion-assistant`**

캔버스, MVP 범위, 이미 정한 기능 목록, 리스크를 보고 "이런 기능도 필요하지 않을까요?"라고
제안해주는 API입니다. **다른 API와 달리 응답이 객체가 아니라 배열**입니다. 제안할 게
없으면 빈 배열 `[]`이 옵니다.

**요청 예시**
```json
{
  "operation": "suggestion",
  "canvasContext": [{ "field": "problem", "value": "..." }],
  "mvpScopeContext": [{ "field": "scope", "value": "..." }],
  "existingFeatures": [
    { "name": "로그인", "priority": "must", "inScope": true }
  ],
  "riskContext": [{ "field": "risk", "value": "..." }],
  "language": "ko"
}
```

**응답 예시**
```json
[
  {
    "name": "재고 알림 기능",
    "rationale": "재고가 부족할 때 자동으로 알려주면 사용자가 더 자주 앱을 켜게 됩니다",
    "primaryUserValue": "재고 부족을 놓치지 않게 됨",
    "priority": "should"
  }
]
```

---

## 4. MVP 기획 도우미 — 첫 버전에 뭘 넣을지 결정 돕기

**`POST /api/mvp-planning-assistant`**

캔버스 내용과 리스크를 보고 "MVP(최소 기능 제품)에는 이런 걸 넣으면 좋겠다"고 제안합니다.

**요청 예시**
```json
{
  "operation": "suggestion",
  "canvasContext": [{ "field": "problem", "value": "..." }],
  "riskContext": [{ "field": "risk", "value": "..." }],
  "language": "ko"
}
```

**응답 예시**
```json
{ "suggestionText": "MVP는 재고 등록과 알림 기능만 포함하는 것을 추천합니다..." }
```

---

## 5. 온보딩 프리셋 도우미 — 프로젝트 시작할 때 질문 보기 옵션 만들어주기

**`POST /api/onboarding-preset-assistant`**

프로젝트를 막 만들었을 때, 아직 캔버스에 아무것도 안 쓴 상태에서 자동으로 한 번
호출됩니다. "사업 아이디어가 뭔가요?" 같은 5개 질문에 대해 사용자가 고를 수 있는
선택지(보기)를 만들어줍니다. 그래서 이 API는 다른 것들과 달리 `canvasContext`나
`operation`이 없습니다 — 프로젝트 이름/설명만 있으면 됩니다.

**요청 예시**
```json
{
  "projectName": "우리 가게 재고 앱",
  "projectDescription": "소상공인을 위한 재고 관리 서비스",
  "language": "ko"
}
```

**응답 예시** (`questionId`는 항상 아래 5개가 전부 옴)
```json
{
  "presets": [
    { "questionId": "business_idea", "options": ["옵션 1", "옵션 2", "옵션 3"] },
    { "questionId": "problem_definition", "options": ["...", "...", "..."] },
    { "questionId": "target_customer", "options": ["...", "...", "..."] },
    { "questionId": "solution_definition", "options": ["...", "...", "..."] },
    { "questionId": "value_proposition", "options": ["...", "...", "..."] }
  ]
}
```

---

## 6. 프로젝트 요약 도우미 — 지금까지 내용을 한 줄 요약

**`POST /api/project-summary-assistant`**

캔버스 내용을 바탕으로 프로젝트를 한눈에 볼 수 있게 요약해줍니다. 프로젝트를 막
만들었을 때 자동으로 호출되면 `operation: "initial_generation"`, 이후 사용자가 캔버스를
수정한 뒤 다시 맞춰볼 때는 `operation: "sync"`를 씁니다 — 둘 다 요청/응답 모양은 같고,
언제 호출되는지만 다릅니다.

**요청 예시**
```json
{
  "operation": "initial_generation",
  "canvasContext": [{ "field": "problem", "value": "..." }],
  "language": "ko"
}
```

**응답 예시**
```json
{ "summaryText": "소상공인을 위한 재고 관리 앱으로, 엑셀 관리의 불편함을 해소합니다." }
```

---

## 7. 리스크 메모 도우미 — 기술/사업 리스크나 열린 질문 제안

**`POST /api/risk-memo-assistant`**

캔버스 내용을 보고 기술적 리스크, 사업적 리스크, 또는 아직 답하지 못한 질문을
제안해줍니다. `targetField`로 어떤 종류를 원하는지 지정합니다.

**요청 예시**
```json
{
  "operation": "suggestion",
  "canvasContext": [{ "field": "problem", "value": "..." }],
  "targetField": "technical_risks",
  "siblingFields": [
    { "field": "business_risks", "value": "경쟁사가 이미 있음" }
  ],
  "language": "ko"
}
```

**응답 예시**
```json
{ "suggestionText": "실시간 재고 동기화 시 오프라인 상태 처리가 기술적 리스크가 될 수 있습니다." }
```

> 참고: 이 API의 계약(Contract)은 아직 "Draft" 단계로, 다른 API들보다 변경될 가능성이
> 조금 더 있습니다.

---

## 8. 검증 계획 도우미 — 가설을 어떻게 검증할지 제안

**`POST /api/validation-planning-assistant`**

캔버스, 리스크, MVP 내용을 모두 참고해서 "이 가설을 이렇게 검증해보세요"라고
제안해주는, 이 중 가장 많은 맥락 정보를 필요로 하는 API입니다.

**요청 예시**
```json
{
  "operation": "suggestion",
  "canvasContext": [{ "field": "problem", "value": "..." }],
  "riskContext": [{ "field": "risk", "value": "..." }],
  "mvpContext": [{ "field": "scope", "value": "..." }],
  "language": "ko"
}
```

**응답 예시**
```json
{ "suggestionText": "소규모 매장 5곳을 대상으로 2주간 무료 체험을 진행해 재고 등록 빈도를 측정해보세요." }
```

---

## 자주 헷갈리는 부분 정리

- 거의 모든 응답은 `{ suggestionText, rationale? }` 형태지만, **기능 제안 도우미만
  배열**을 돌려줍니다.
- `rationale`(이유 설명)은 대부분 선택적으로만 옵니다 — 캔버스 도우미는 `refinement`
  요청일 때만 채워줍니다.
- `language`는 거의 모든 요청에 필수이며 `"ko"` 또는 `"en"`만 가능합니다.
- 온보딩 프리셋 도우미만 캔버스 맥락 없이 프로젝트 이름/설명만으로 동작합니다 — 아직
  캔버스가 비어 있는 시점에 쓰이기 때문입니다.

세부 필드 타입, 필수/선택 여부, 에러 코드의 완전한 목록은 `app/server/api_spec.md`를
참고하세요.
