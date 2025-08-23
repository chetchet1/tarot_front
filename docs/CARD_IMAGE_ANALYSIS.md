# 카드 이미지 시스템 통합 가이드

## 개요
타로 카드 이미지 출력 시스템이 `unifiedCardImage.ts` 파일로 완전히 통합되었습니다. 이 문서는 통합된 시스템의 구조와 사용법을 설명합니다.

## 핵심 파일 구조

### 1. 메인 유틸리티: `/app/utils/unifiedCardImage.ts`
모든 카드 이미지 관련 로직이 집중된 단일 진실 공급원(Single Source of Truth)

### 2. 레거시 호환성 파일 (Deprecated)
- `/app/utils/cardImageUtils.ts` - 하위 호환성을 위한 리다이렉트만 제공
- `/app/utils/cardUtils.ts` - 하위 호환성을 위한 리다이렉트만 제공

## 카드 이미지 파일 구조

### 디렉토리 구조
```
/assets/tarot-cards/
├── major/           # 메이저 아르카나 (0-21)
├── minor/           # 모든 마이너 아르카나 (수트별 하위 폴더 없음!)
└── back.jpg         # 카드 뒷면
```

### 메이저 아르카나 파일명 규칙
- **형식**: `{번호}-{카드명}.png`
- **대소문자 규칙**: 
  - 번호는 2자리 (00-21)
  - 카드명의 각 단어 첫 글자는 대문자
  - 단, "the"로 시작하는 첫 번째 카드는 소문자
- **예시**:
  ```
  00-the-Fool.png         (the는 소문자, Fool은 대문자)
  01-The-Magician.png     (The는 대문자)
  02-The-High-Priestess.png
  10-Wheel-of-Fortune.png (하이픈으로 연결된 각 단어 대문자)
  ```

### 마이너 아르카나 - 숫자 카드 (1-10)
- **형식**: `{번호}-{영문숫자}-of-{수트}.png`
- **대소문자 규칙**: 모두 소문자
- **예시**:
  ```
  01-ace-of-cups.png
  02-two-of-wands.png
  10-ten-of-swords.png
  ```

### 마이너 아르카나 - 코트 카드
- **형식**: `{파일번호}-{코트명}-of-{수트명}.png`
- **대소문자 규칙**: 코트명과 수트명 첫 글자 대문자
- **파일번호 체계**:
  ```
  Wands:     41-44 (Page, Knight, Queen, King)
  Cups:      45-48 (Page, Knight, Queen, King)
  Swords:    49-52 (Page, Knight, Queen, King)
  Pentacles: 53-56 (Page, Knight, Queen, King)
  ```
- **예시**:
  ```
  41-Page-of-Wands.png
  48-King-of-Cups.png
  52-King-of-Swords.png
  56-King-of-Pentacles.png
  ```

## DB ID 매핑 체계

### 전체 ID 범위: 0-77

#### 메이저 아르카나 (0-21)
```
0: The Fool
1: The Magician
...
21: The World
```

#### 마이너 아르카나 - Cups (22-35)
```
22-31: Ace through Ten of Cups
32: Page of Cups
33: Knight of Cups
34: Queen of Cups
35: King of Cups
```

#### 마이너 아르카나 - Wands (36-49)
```
36-45: Ace through Ten of Wands
46: Page of Wands
47: Knight of Wands
48: Queen of Wands
49: King of Wands
```

#### 마이너 아르카나 - Swords (50-63)
```
50-59: Ace through Ten of Swords
60: Page of Swords
61: Knight of Swords
62: Queen of Swords
63: King of Swords
```

#### 마이너 아르카나 - Pentacles (64-77)
```
64-73: Ace through Ten of Pentacles
74: Page of Pentacles
75: Knight of Pentacles
76: Queen of Pentacles
77: King of Pentacles
```

## 통합 함수 사용법

### 메인 함수: `getUnifiedCardImagePath(card)`

#### 지원하는 카드 데이터 형식 (우선순위 순)

1. **DB ID 기반** (가장 정확)
   ```typescript
   // card.id, card.cardNumber, card.card_id 중 하나
   const card = { id: 0 };  // The Fool
   const card = { cardNumber: 22 };  // Ace of Cups
   const card = { card_id: 41 };  // Page of Wands
   ```

2. **Supabase URL** (이미 완성된 경로)
   ```typescript
   const card = { imageUrl: '/assets/tarot-cards/major/00-the-Fool.png' };
   ```

3. **속성 기반** (arcana, number, suit)
   ```typescript
   // 메이저 아르카나
   const card = { arcana: 'major', number: 0 };
   
   // 마이너 숫자 카드
   const card = { arcana: 'minor', suit: 'cups', number: 1 };  // Ace of Cups
   
   // 마이너 코트 카드
   const card = { arcana: 'minor', suit: 'wands', number: 11 };  // Page of Wands
   const card = { court: 'king', suit: 'swords' };  // King of Swords
   ```

### 보조 함수들

#### 역방향 카드 확인
```typescript
isCardReversed(card: any): boolean
// card.is_reversed, card.isReversed, card.orientation 체크
```

#### 이미지 로드 에러 처리
```typescript
handleUnifiedImageError(event: Event): void
// 이미지 로드 실패 시 🎴 이모지 표시
```

## 컴포넌트에서 사용 예시

### Vue 컴포넌트
```vue
<template>
  <img 
    :src="getUnifiedCardImagePath(card)"
    :class="{ 'reversed': isCardReversed(card) }"
    @error="handleUnifiedImageError"
  />
</template>

<script setup>
import { 
  getUnifiedCardImagePath, 
  isCardReversed, 
  handleUnifiedImageError 
} from '@/utils/unifiedCardImage';

const card = { id: 0 };  // The Fool
</script>
```

### TypeScript 사용
```typescript
import { getUnifiedCardImagePath } from '@/utils/unifiedCardImage';

// DB에서 가져온 카드
const dbCard = { id: 22, name: 'Ace of Cups' };
const imagePath = getUnifiedCardImagePath(dbCard);

// 속성 기반 카드
const customCard = { arcana: 'major', number: 10 };
const imagePath2 = getUnifiedCardImagePath(customCard);
```

## 자동 경로 보정 기능

### Supabase URL 자동 수정
1. **수트 폴더 제거**: `/minor/cups/` → `/minor/`
2. **대소문자 자동 수정**: 메이저 아르카나 파일명 교정

### 폴백 처리
- 카드 데이터 없음 → 카드 뒷면 (`back.jpg`)
- 매핑 실패 → The Fool 카드 (기본값)
- 이미지 로드 실패 → 🎴 이모지

## 마이그레이션 가이드

### 기존 코드 업데이트
```typescript
// 이전 (Deprecated)
import { getCardImagePath } from '@/utils/cardUtils';
import { getCardImageUrl } from '@/utils/cardImageUtils';

// 현재 (권장)
import { getUnifiedCardImagePath } from '@/utils/unifiedCardImage';
```

### 하위 호환성
기존 함수들은 자동으로 `unifiedCardImage.ts`로 리다이렉트되므로 즉시 수정하지 않아도 작동합니다.

## 디버깅 가이드

### 콘솔 경고 메시지
- `[UnifiedCardImage] 카드 데이터가 없습니다` - 빈 카드 객체
- `[UnifiedCardImage] 카드 이미지 경로를 생성할 수 없습니다` - 매핑 실패

### 일반적인 문제 해결

1. **이미지가 표시되지 않음**
   - DB ID 확인 (0-77 범위)
   - 파일명 대소문자 확인
   - 네트워크 탭에서 404 에러 확인

2. **잘못된 카드 표시**
   - DB ID 매핑 테이블 확인
   - 카드 데이터 구조 확인

3. **역방향 카드 처리**
   - `isCardReversed()` 함수 사용
   - CSS transform 적용 확인

## 중요 참고사항

### ⚠️ 절대 수정 금지
- DB ID 매핑 테이블 (`DB_ID_TO_FILE_MAP`)
- 파일명 규칙
- 디렉토리 구조

### ✅ 수정 가능
- 폴백 처리 로직
- 에러 핸들링 UI
- 추가 유틸리티 함수

## 테스트 체크리스트

카드 이미지 관련 수정 시 다음 항목 테스트 필수:

- [ ] 메이저 아르카나 22장 모두 표시
- [ ] 마이너 숫자 카드 40장 표시
- [ ] 마이너 코트 카드 16장 표시
- [ ] 역방향 카드 표시
- [ ] 이미지 로드 실패 시 폴백
- [ ] 모든 스프레드 레이아웃에서 정상 작동
- [ ] 히스토리 페이지 카드 표시
- [ ] 공유 링크 카드 표시

---

**최종 업데이트**: 2025-08-23
**작성자**: Claude AI Assistant
**버전**: 2.0 (통합 시스템)