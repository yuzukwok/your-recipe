import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() { }

  /**
   * 显示成功通知
   * @param message 消息内容
   */
  success(message: string): void {
    this.showNotification(message, 'success');
  }

  /**
   * 显示错误通知
   * @param message 消息内容
   */
  error(message: string): void {
    this.showNotification(message, 'error');
  }

  /**
   * 显示警告通知
   * @param message 消息内容
   */
  warning(message: string): void {
    this.showNotification(message, 'warning');
  }

  /**
   * 显示信息通知
   * @param message 消息内容
   */
  info(message: string): void {
    this.showNotification(message, 'info');
  }

  /**
   * 显示通知的内部方法
   * 注意：这里仅使用console.log实现，实际项目中应替换为真实的通知组件如Angular Material Snackbar等
   * @param message 消息内容
   * @param type 通知类型
   */
  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const styles = {
      success: 'color: #155724; background-color: #d4edda;',
      error: 'color: #721c24; background-color: #f8d7da;',
      warning: 'color: #856404; background-color: #fff3cd;',
      info: 'color: #0c5460; background-color: #d1ecf1;'
    };

    console.log(`%c ${type.toUpperCase()}: ${message}`, styles[type]);
    
    // 在实际项目中，这里应该替换为真实的通知组件实现
    // 例如使用Angular Material的Snackbar:
    // this.snackBar.open(message, 'Close', {
    //   duration: 3000,
    //   panelClass: [`${type}-snackbar`]
    // });
    
    // 或者使用第三方库如ngx-toastr:
    // this.toastr[type](message);
    
    // 现在使用alert作为临时方案，但不推荐在生产环境中使用
    alert(`${type.toUpperCase()}: ${message}`);
  }
} 