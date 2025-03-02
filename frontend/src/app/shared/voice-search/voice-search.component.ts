import { Component, EventEmitter, Output, OnDestroy, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-voice-search',
  template: `
    <div class="relative inline-block">
      <button 
        [ngClass]="{'text-orange-600': isListening, 'text-gray-500 hover:text-orange-500': !isListening}"
        class="p-2 rounded-full transition-colors duration-300 flex items-center justify-center" 
        (click)="toggleListening()"
        [title]="isListening ? '停止语音输入' : '开始语音输入'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path *ngIf="!isListening" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          <path *ngIf="isListening" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </button>
      
      <!-- 语音状态指示器 -->
      <div *ngIf="isListening" class="absolute inset-0 animate-pulse rounded-full border-2 border-orange-500 -z-10"></div>
      
      <!-- 识别结果提示（只在识别过程中显示，结果确认后自动隐藏） -->
      <div *ngIf="isListening && currentTranscript && !recognitionComplete" 
        class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg p-2 z-10 w-48 text-center">
        <p class="text-sm text-gray-700 truncate">{{ currentTranscript }}</p>
      </div>
      
      <!-- 识别完成的提示 -->
      <div *ngIf="recognitionComplete" 
        class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-orange-50 shadow-md rounded-lg p-2 z-10 w-48 text-center"
        [ngStyle]="{'opacity': completeFeedbackOpacity}">
        <p class="text-sm text-orange-700">✓ 已识别: "{{ lastTranscript }}"</p>
      </div>
    </div>
  `,
  styles: []
})
export class VoiceSearchComponent implements OnDestroy {
  @Output() searchTermChange = new EventEmitter<string>();
  
  isListening = false;
  currentTranscript = '';
  lastTranscript = '';
  recognitionComplete = false;
  completeFeedbackOpacity = 1;
  
  private recognition: any;
  private speechSupported = false;
  private fadeTimeout: any;
  
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.speechSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'zh-CN'; // 设置为中文
      
      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        this.currentTranscript = transcript;
        
        // 如果是最终结果，向父组件发送
        if (event.results[0].isFinal) {
          this.recognitionComplete = true;
          this.lastTranscript = transcript;
          this.searchTermChange.emit(transcript);
          
          // 停止监听
          this.stopListening();
          
          // 显示成功反馈，然后淡出
          this.showSuccessFeedback();
          
          // 尝试将焦点设置在输入框上
          this.focusInputField();
        }
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        this.stopListening();
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
    } else {
      console.warn('浏览器不支持语音识别');
    }
  }
  
  ngOnDestroy(): void {
    this.stopListening();
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }
  }
  
  toggleListening(): void {
    if (!this.speechSupported) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }
    
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }
  
  private startListening(): void {
    this.currentTranscript = '';
    this.recognitionComplete = false;
    this.isListening = true;
    this.recognition.start();
  }
  
  private stopListening(): void {
    if (this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
  
  private showSuccessFeedback(): void {
    // 清除之前的淡出定时器（如果有）
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }
    
    // 设置淡出效果
    this.completeFeedbackOpacity = 1;
    
    // 2秒后开始淡出
    this.fadeTimeout = setTimeout(() => {
      // 创建淡出动画
      const fadeEffect = setInterval(() => {
        if (this.completeFeedbackOpacity > 0) {
          this.completeFeedbackOpacity -= 0.1;
        } else {
          clearInterval(fadeEffect);
          this.recognitionComplete = false;
        }
      }, 50);
      
      // 确保淡出动画最终会结束
      setTimeout(() => {
        clearInterval(fadeEffect);
        this.recognitionComplete = false;
      }, 1000);
    }, 2000);
  }
  
  private focusInputField(): void {
    // 尝试找到相邻的输入框并设置焦点
    setTimeout(() => {
      // 首先尝试通过ID查找输入框
      const inputField = document.getElementById('recipe-search-input') as HTMLInputElement;
      
      if (inputField) {
        // 确保输入框显示识别的文本
        inputField.value = this.lastTranscript;
        
        // 强制触发input事件，以确保Angular的ngModel能够正确更新
        const event = new Event('input', { bubbles: true });
        inputField.dispatchEvent(event);
        
        // 设置输入框焦点
        inputField.focus();
      } else {
        // 备用方案：尝试找到相邻的输入框
        const parentElement = this.elementRef.nativeElement.parentElement;
        if (parentElement) {
          const nearbyInput = parentElement.querySelector('input');
          if (nearbyInput) {
            // 确保输入框显示识别的文本
            nearbyInput.value = this.lastTranscript;
            
            // 强制触发input事件，以确保Angular的ngModel能够正确更新
            const inputEvent = new Event('input', { bubbles: true });
            nearbyInput.dispatchEvent(inputEvent);
            
            // 设置输入框焦点
            nearbyInput.focus();
          }
        }
      }
    }, 100);
  }
} 