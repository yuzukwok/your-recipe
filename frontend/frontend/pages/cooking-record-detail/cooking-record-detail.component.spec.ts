import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookingRecordDetailComponent } from './cooking-record-detail.component';

describe('CookingRecordDetailComponent', () => {
  let component: CookingRecordDetailComponent;
  let fixture: ComponentFixture<CookingRecordDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookingRecordDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CookingRecordDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
