import { Component, OnInit } from '@angular/core';
import { CookingRecord } from '../../models';
import { CookingRecordService, AuthService, NotificationService } from '../../services';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// 扩展 CookingRecord 接口以包含 displayImageUrl 属性
interface CookingRecordWithDisplay extends CookingRecord {
  displayImageUrl?: string | null;
}

@Component({
  selector: 'app-cooking-record-list',
  templateUrl: './cooking-record-list.component.html',
  styleUrls: ['./cooking-record-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CookingRecordListComponent implements OnInit {
  cookingRecords: CookingRecordWithDisplay[] = [];
  isLoading = true;
  loadingMore = false;
  error: string | null = null;
  page = 1;
  limit = 12;
  noMoreRecords = false;
  currentUserId: number | null = null;

  constructor(
    private cookingRecordService: CookingRecordService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    this.loadCookingRecords();
  }

  loadCookingRecords(): void {
    this.isLoading = true;
    this.cookingRecordService.getCookingRecords({
      skip: (this.page - 1) * this.limit,
      limit: this.limit
    }).subscribe({
      next: (records) => {
        this.cookingRecords = records as CookingRecordWithDisplay[];
        this.processRecordImages();
        this.isLoading = false;
        this.noMoreRecords = records.length < this.limit;
      },
      error: (err) => {
        console.error('获取烹饪记录失败', err);
        this.error = '获取烹饪记录失败，请稍后再试';
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    if (this.loadingMore || this.noMoreRecords) return;
    
    this.loadingMore = true;
    this.page++;
    
    this.cookingRecordService.getCookingRecords({
      skip: (this.page - 1) * this.limit,
      limit: this.limit
    }).subscribe({
      next: (records) => {
        if (records.length === 0) {
          this.noMoreRecords = true;
        } else {
          this.cookingRecords = [...this.cookingRecords, ...(records as CookingRecordWithDisplay[])];
          this.processRecordImages();
          this.noMoreRecords = records.length < this.limit;
        }
        this.loadingMore = false;
      },
      error: (err) => {
        console.error('加载更多记录失败', err);
        this.loadingMore = false;
        this.page--; // 恢复页码
      }
    });
  }

  processRecordImages(): void {
    this.cookingRecords.forEach(record => {
      if (record.images && record.images.length > 0) {
        // 确保URL是有效的完整URL
        let imageUrl = record.images[0];
        
        // 检查图片URL是否是相对路径，如果是则添加基础URL
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          // 假设API服务地址是从环境或配置中获取的
          // 这里使用相对路径，将由API服务处理
          imageUrl = `/api/v1/images/${imageUrl}/download`;
        }
        
        record.displayImageUrl = imageUrl;
      } else {
        record.displayImageUrl = null;
      }
    });
  }

  getStarArray(rating: number | undefined): number[] {
    return rating ? Array(rating).fill(0).map((_, i) => i + 1) : [];
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  }

  formatCookingTime(minutes: number | undefined): string {
    if (!minutes) return '未记录';
    
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
  }

  /**
   * 检查记录是否属于当前用户
   */
  isCurrentUserRecord(record: CookingRecord): boolean {
    // 确保currentUserId有值且与记录的user_id匹配
    return !!this.currentUserId && record.user_id === this.currentUserId;
  }

  /**
   * 确认删除烹饪记录
   */
  confirmDeleteRecord(record: CookingRecord, event: Event): void {
    event.stopPropagation(); // 阻止事件冒泡
    
    if (!record || !record.id) {
      console.error('无法删除记录：记录ID不存在');
      return;
    }
    
    // 再次检查是否是当前用户的记录
    if (!this.isCurrentUserRecord(record)) {
      this.notificationService.error('您没有权限删除此烹饪记录，只有记录创建者才能删除');
      return;
    }
    
    // 使用原生window.confirm
    const confirmed = window.confirm('您确定要删除这条烹饪记录吗？此操作不可撤销且只有记录创建者可以执行。');
    if (confirmed) {
      this.deleteRecord(record);
    }
  }
  
  /**
   * 删除烹饪记录
   */
  private deleteRecord(record: CookingRecord): void {
    if (!record || !record.id) return;
    
    this.cookingRecordService.deleteCookingRecord(record.id).subscribe({
      next: () => {
        this.notificationService.success('烹饪记录已成功删除');
        // 从列表中移除已删除的记录
        this.cookingRecords = this.cookingRecords.filter(r => r.id !== record.id);
      },
      error: (err) => {
        console.error('删除烹饪记录失败', err);
        
        // 针对不同错误类型显示不同消息
        if (err.status === 403) {
          this.notificationService.error('您没有权限删除此烹饪记录，只有记录创建者才能删除');
        } else if (err.status === 404) {
          this.notificationService.error('烹饪记录不存在或已被删除');
          // 从列表中移除不存在的记录
          this.cookingRecords = this.cookingRecords.filter(r => r.id !== record.id);
        } else {
          this.notificationService.error('删除烹饪记录失败，请稍后再试');
        }
      }
    });
  }
} 