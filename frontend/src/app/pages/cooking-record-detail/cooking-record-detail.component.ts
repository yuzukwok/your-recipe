import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CookingRecord } from '../../models';
import { CookingRecordService, NotificationService, AuthService } from '../../services';
import { CommonModule } from '@angular/common';

interface CookingRecordWithDisplayImages extends CookingRecord {
  displayImageUrls?: string[];
}

@Component({
  selector: 'app-cooking-record-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cooking-record-detail.component.html',
  styleUrl: './cooking-record-detail.component.scss'
})
export class CookingRecordDetailComponent implements OnInit {
  cookingRecord: CookingRecordWithDisplayImages | null = null;
  isLoading = true;
  error: string | null = null;
  currentUserId: number | null = null;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cookingRecordService: CookingRecordService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    this.loadCookingRecord();
  }

  loadCookingRecord(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = '未找到烹饪记录ID';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.cookingRecordService.getCookingRecord(Number(id)).subscribe({
      next: (record) => {
        this.cookingRecord = record as CookingRecordWithDisplayImages;
        this.processRecordImages();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('获取烹饪记录失败', err);
        this.error = '获取烹饪记录失败，请稍后再试';
        this.isLoading = false;
      }
    });
  }

  processRecordImages(): void {
    if (!this.cookingRecord) return;
    
    if (this.cookingRecord.images && this.cookingRecord.images.length > 0) {
      // 处理所有图片URL
      this.cookingRecord.displayImageUrls = this.cookingRecord.images.map(imageUrl => {
        // 检查图片URL是否是相对路径，如果是则添加基础URL
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          // 构建完整URL
          return `/api/v1/images/${imageUrl}/download`;
        }
        return imageUrl;
      });
    }
  }

  prevImage(): void {
    if (!this.cookingRecord || !this.cookingRecord.displayImageUrls || !this.cookingRecord.displayImageUrls.length) return;
    
    this.currentImageIndex = (this.currentImageIndex - 1 + this.cookingRecord.displayImageUrls.length) % this.cookingRecord.displayImageUrls.length;
  }

  nextImage(): void {
    if (!this.cookingRecord || !this.cookingRecord.displayImageUrls || !this.cookingRecord.displayImageUrls.length) return;
    
    this.currentImageIndex = (this.currentImageIndex + 1) % this.cookingRecord.displayImageUrls.length;
  }

  /**
   * 检查记录是否属于当前用户
   */
  isCurrentUserRecord(): boolean {
    return !!this.currentUserId && !!this.cookingRecord?.user_id && this.cookingRecord.user_id === this.currentUserId;
  }

  confirmDeleteRecord(): void {
    if (!this.cookingRecord || !this.cookingRecord.id) return;
    
    // 再次检查是否是当前用户的记录
    if (!this.isCurrentUserRecord()) {
      this.notificationService.error('您没有权限删除此烹饪记录，只有记录创建者才能删除');
      return;
    }
    
    // 使用原生window.confirm
    const confirmed = window.confirm('您确定要删除这条烹饪记录吗？此操作不可撤销且只有记录创建者可以执行。');
    if (confirmed) {
      this.deleteRecord();
    }
  }
  
  private deleteRecord(): void {
    if (!this.cookingRecord || !this.cookingRecord.id) return;
    
    this.cookingRecordService.deleteCookingRecord(this.cookingRecord.id).subscribe({
      next: () => {
        this.notificationService.success('烹饪记录已成功删除');
        // 删除成功后返回列表页
        this.router.navigate(['/cooking-records']);
      },
      error: (err) => {
        console.error('删除烹饪记录失败', err);
        
        // 针对不同错误类型显示不同消息
        if (err.status === 403) {
          this.notificationService.error('您没有权限删除此烹饪记录，只有记录创建者才能删除');
        } else if (err.status === 404) {
          this.notificationService.error('烹饪记录不存在或已被删除');
          this.router.navigate(['/cooking-records']);
        } else {
          this.notificationService.error('删除烹饪记录失败，请稍后再试');
        }
      }
    });
  }

  getStarArray(rating: number | undefined): number[] {
    return rating ? Array(rating).fill(0).map((_, i) => i + 1) : [];
  }

  formatDate(dateString: string | undefined): string {
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

  goBack(): void {
    this.router.navigate(['/cooking-records']);
  }

  // 添加一个辅助方法来安全地访问displayImageUrls数组
  getDisplayImageUrl(index: number): string {
    if (!this.cookingRecord || !this.cookingRecord.displayImageUrls || this.cookingRecord.displayImageUrls.length === 0) {
      return '';
    }
    
    // 确保索引在有效范围内
    const safeIndex = Math.min(Math.max(0, index), this.cookingRecord.displayImageUrls.length - 1);
    return this.cookingRecord.displayImageUrls[safeIndex] || '';
  }
  
  // 安全地获取displayImageUrls的长度
  getDisplayImageUrlsLength(): number {
    return this.cookingRecord?.displayImageUrls?.length || 0;
  }
  
  // 检查是否有图片可以显示
  hasDisplayImages(): boolean {
    return !!this.cookingRecord?.displayImageUrls && this.cookingRecord.displayImageUrls.length > 0;
  }
  
  // 检查是否有多张图片
  hasMultipleDisplayImages(): boolean {
    return !!this.cookingRecord?.displayImageUrls && this.cookingRecord.displayImageUrls.length > 1;
  }
}
