import { TestBed } from '@angular/core/testing';

import { BluetoothWebService } from './bluetooth-web.service';

describe('BluetoothWebService', () => {
  let service: BluetoothWebService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BluetoothWebService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
