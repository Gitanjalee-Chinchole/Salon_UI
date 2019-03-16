import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueItemStockComponent } from './issue-item-stock.component';

describe('IssueItemStockComponent', () => {
  let component: IssueItemStockComponent;
  let fixture: ComponentFixture<IssueItemStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueItemStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueItemStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
