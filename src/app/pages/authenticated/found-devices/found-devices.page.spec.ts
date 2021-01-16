import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FoundDevicesPage } from './found-devices.page';

describe('FoundDevicesPage', () => {
  let component: FoundDevicesPage;
  let fixture: ComponentFixture<FoundDevicesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoundDevicesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FoundDevicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
