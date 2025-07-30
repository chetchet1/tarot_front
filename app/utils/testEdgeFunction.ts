// Edge Function 디버그 테스트
export async function testEdgeFunction() {
  const testData = {
    allCards: [
      {
        id: 1,
        name: "The Fool",
        nameKr: "바보",
        name_kr: "바보",
        arcana: "major",
        number: 0,
        orientation: "upright",
        position: {
          position: 1,
          name: "현재내면"
        }
      },
      {
        id: 2,
        name: "The Magician",
        nameKr: "마법사",
        name_kr: "마법사",
        arcana: "major",
        number: 1,
        orientation: "reversed",
        position: {
          position: 2,
          name: "현재외부"
        }
      }
    ],
    topic: "love",
    spreadType: "celtic_cross",
    isPremium: true,
    interpretationType: "overall"
  };

  console.log('테스트 데이터:', testData);

  try {
    // Supabase URL 직접 사용
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase 환경 변수가 설정되지 않았습니다');
      return;
    }

    const url = `${supabaseUrl}/functions/v1/generate-interpretation`;
    
    console.log('Edge Function URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const responseText = await response.text();
    console.log('Response text:', responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
    }

  } catch (error) {
    console.error('테스트 실패:', error);
  }
}

// 브라우저 콘솔에서 실행 가능하도록
if (typeof window !== 'undefined') {
  (window as any).testEdgeFunction = testEdgeFunction;
}
