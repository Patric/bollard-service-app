import { Injectable, Injector } from '@angular/core';
import { BluetoothNativeService } from './platform-services/bluetooth-native.service';
import { BluetoothWebService } from './platform-services/bluetooth-web.service';
import { Platform } from '@ionic/angular';
import { of } from 'rxjs';

import { BluetoothAbstract } from './platform-services/bluetooth-abstract';


@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  public get ble(): BluetoothAbstract{
    if(this.platform.is(`mobile`) && !this.platform.is(`mobileweb`)){
      return this.injector.get(BluetoothNativeService);
    }
    else if(this.platform.is(`mobileweb`) || this.platform.is(`desktop`)){
      return this.injector.get(BluetoothWebService)
    }
  }
  constructor(private injector: Injector, private platform: Platform) {}


  ready(){
    return this.platform.ready();
   }

  throwError(){
    throw new Error(`Platform ${this.platform.platforms} is unsupported.`);
  }
}
