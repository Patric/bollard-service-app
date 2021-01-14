import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AuthenticatedPage } from './authenticated.page';

describe('AuthenticatedPage', () => {
  let component: AuthenticatedPage;
  let fixture: ComponentFixture<AuthenticatedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthenticatedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticatedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
