# 세븐스타 버그 수정 내역

## 수정 날짜: 2025-01-14

## 수정된 문제들

### 1. generateInterpretation API 중복 호출 문제
- **문제**: handleInterpretationClick → goToResult 호출 시 API가 2번 호출됨 (커스텀프롬프트 1회 + 일반 요청 1회)
- **원인**: isProcessingResult 플래그가 제대로 관리되지 않음
- **해결**: 
  - isProcessingResult 플래그를 더 엄격하게 관리
  - API 호출 전후로 플래그 체크 강화
  - 컴포넌트 언마운트 시 플래그 리셋

### 2. 연애 상태 정보 전달 문제
- **문제**: 연애 상태(솔로/커플) 선택 후 API 호출 시 전달되지 않음
- **원인**: tarotStore의 relationshipStatus가 AI 해석 요청에 포함되지 않음
- **해결**:
  - CardDrawing.vue에서 AI 해석 요청 시 relationshipStatus 포함
  - SevenStarInterpreter와 CupOfRelationshipInterpreter에서 연애 상태 처리 확인

## 수정된 파일들

1. **CardDrawing.vue**
   - isProcessingResult 플래그 관리 개선
   - 연애 상태 정보를 AI 해석 요청에 포함
   - 컴포넌트 언마운트 시 플래그 리셋 추가

2. **관련 서비스들**
   - SevenStarInterpreter.ts - setRelationshipStatus 메서드 확인
   - CupOfRelationshipInterpreter.ts - setRelationshipStatus 메서드 확인

## 테스트 방법

1. 세븐스타 배열 선택
2. 연애 주제 선택
3. 카드 뽑기 후 연애 상태 선택
4. 해석 보기 클릭
5. 네트워크 탭에서 API 호출 횟수 확인 (1회만 호출되어야 함)
6. AI 해석에 연애 상태가 반영되었는지 확인

## 주의사항

- isProcessingResult 플래그는 컴포넌트 라이프사이클과 연동되어 관리됨
- 연애 상태는 tarotStore에 저장되며, 해석 생성 시 자동으로 전달됨
