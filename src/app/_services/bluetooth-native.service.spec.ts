import { TestBed } from '@angular/core/testing';

import { BluetoothNativeService } from './bluetooth-native.service';

describe('BluetoothService', () => {
  let service: BluetoothNativeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BluetoothNativeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
