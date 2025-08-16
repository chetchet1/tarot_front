# 작업 중단 - 파일 크기 문제

컵 오브 릴레이션십 모달 제거 작업을 진행하려 했으나, CardDrawing.vue 파일이 너무 커서 직접 편집이 어렵습니다.

## 진행 상황:
1. 문제 확인: `CardDrawing.vue`에서 컵 오브 릴레이션십 선택 시 중복으로 "마음에 둔 상대가 있을 경우" 확인 모달이 표시됨
2. 위치 파악: 
   - `confirmManualSelection` 함수 (수동 선택 시)
   - `startDrawing` 함수 (무작위 뽑기 시)
   두 곳에서 해당 모달이 표시됨

## 수정해야 할 부분:

### 1. confirmManualSelection 함수에서:
```javascript
// 기존 코드
if (isCupOfRelationship.value) {
  const confirmed = await showConfirm({
    title: '컵 오브 릴레이션십',
    message: '이 배열법은 마음에 둔 상대가 있을 경우 선택하시는게 가장 좋습니다.\n계속 하시겠습니까?'
  });
  
  if (!confirmed) {
    router.go(-1);
    return;
  }
}

// 삭제하고 바로 진행
```

### 2. startDrawing 함수에서:
```javascript
// 기존 코드
if (isCupOfRelationship.value) {
  console.log('💖 [startDrawing] 컵오브릴레이션십 분기 진입');
  const confirmed = await showConfirm({
    title: '컵 오브 릴레이션십',
    message: '이 배열법은 마음에 둔 상대가 있을 경우 선택하시는게 가장 좋습니다.\n계속 하시겠습니까?'
  });
  
  if (!confirmed) {
    router.go(-1);
    return;
  }
}

// 삭제하고 바로 진행
```

## 다음 작업 지시:
새 대화창에서 이어서 작업하려면 다음과 같이 질문해주세요:

"CardDrawing.vue 파일에서 confirmManualSelection 함수와 startDrawing 함수에 있는 컵 오브 릴레이션십 확인 모달을 제거해줘. 두 함수 모두에서 if (isCupOfRelationship.value) 블록을 삭제하고 바로 진행하도록 수정해줘."