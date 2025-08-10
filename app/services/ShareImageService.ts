import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import type { Reading } from '../types/reading';

export class ShareImageService {
  /**
   * 점괘 결과를 이미지로 변환하여 공유
   */
  async shareAsImage(reading: Reading, element: HTMLElement): Promise<void> {
    try {
      // 1. HTML을 캔버스로 변환
      const canvas = await html2canvas(element, {
        backgroundColor: '#1a1a2e',
        scale: 2, // 고해상도
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // 2. 캔버스를 Blob으로 변환
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });

      if (Capacitor.isNativePlatform()) {
        // 3-1. 네이티브: 파일로 저장 후 공유
        const fileName = `tarot_${Date.now()}.png`;
        const base64 = await this.blobToBase64(blob);
        
        // 파일 저장
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache
        });

        // 네이티브 공유
        await Share.share({
          title: '타로 점괘 결과',
          text: this.generateShareText(reading),
          url: result.uri,
          dialogTitle: '공유하기'
        });
      } else {
        // 3-2. 웹: 다운로드 또는 Web Share API
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'tarot.png')] })) {
          const file = new File([blob], 'tarot.png', { type: 'image/png' });
          await navigator.share({
            title: '타로 점괘 결과',
            text: this.generateShareText(reading),
            files: [file]
          });
        } else {
          // 다운로드 폴백
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `tarot_${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('이미지 공유 실패:', error);
      throw error;
    }
  }

  /**
   * 공유용 결과 카드 생성 (간단한 버전)
   */
  createShareCard(reading: Reading): HTMLElement {
    const card = document.createElement('div');
    card.className = 'share-card';
    card.style.cssText = `
      width: 400px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: 'Noto Sans KR', sans-serif;
      border-radius: 20px;
      position: fixed;
      left: -9999px;
      top: 0;
    `;

    // 타이틀
    const title = document.createElement('h2');
    title.textContent = '🔮 타로 점괘 결과';
    title.style.cssText = 'font-size: 24px; margin-bottom: 20px; text-align: center;';
    card.appendChild(title);

    // 질문
    if (reading.customQuestion) {
      const question = document.createElement('p');
      question.textContent = `"${reading.customQuestion}"`;
      question.style.cssText = 'font-size: 16px; margin-bottom: 20px; font-style: italic; text-align: center;';
      card.appendChild(question);
    }

    // 카드 목록
    const cardsList = document.createElement('div');
    cardsList.style.cssText = 'margin-bottom: 20px;';
    reading.cards.slice(0, 3).forEach((tarotCard, index) => {
      const cardItem = document.createElement('div');
      cardItem.textContent = `${index + 1}. ${tarotCard.nameKr} (${tarotCard.orientation === 'upright' ? '정방향' : '역방향'})`;
      cardItem.style.cssText = 'font-size: 14px; margin: 5px 0;';
      cardsList.appendChild(cardItem);
    });
    card.appendChild(cardsList);

    // 간단한 해석
    if (reading.overallMessage || reading.aiInterpretation) {
      const interpretation = document.createElement('p');
      const text = reading.aiInterpretation || reading.overallMessage || '';
      interpretation.textContent = text.substring(0, 100) + '...';
      interpretation.style.cssText = 'font-size: 14px; line-height: 1.6; margin-top: 15px;';
      card.appendChild(interpretation);
    }

    // 앱 이름
    const footer = document.createElement('div');
    footer.textContent = '✨ 무료 타로카드 앱';
    footer.style.cssText = 'margin-top: 20px; text-align: center; font-size: 12px; opacity: 0.8;';
    card.appendChild(footer);

    document.body.appendChild(card);
    return card;
  }

  /**
   * Blob을 Base64로 변환
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // data:image/png;base64, 부분 제거
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 공유 텍스트 생성
   */
  private generateShareText(reading: Reading): string {
    let text = '🔮 타로 점괘 결과\n\n';
    
    if (reading.customQuestion) {
      text += `질문: ${reading.customQuestion}\n\n`;
    }

    text += '뽑은 카드:\n';
    reading.cards.slice(0, 3).forEach((card, index) => {
      const orientation = card.orientation === 'upright' ? '정방향' : '역방향';
      text += `${index + 1}. ${card.nameKr} (${orientation})\n`;
    });

    if (reading.cards.length > 3) {
      text += `... 외 ${reading.cards.length - 3}장\n`;
    }

    text += '\n✨ 무료 타로카드 앱에서 점보기';
    
    return text;
  }
}

export const shareImageService = new ShareImageService();
