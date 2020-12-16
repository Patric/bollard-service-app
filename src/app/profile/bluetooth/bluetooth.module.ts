import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BluetoothNativeService } from '../../_services/bluetooth/platform-services/bluetooth-native.service';
import { BluetoothWebService } from '../../_services/bluetooth/platform-services/bluetooth-web.service';
import { BluetoothService } from '../../_services/bluetooth/bluetooth.service';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';

@NgModule({
    imports: [
      CommonModule,
      WebBluetoothModule.forRoot({
        enableTracing: true // or false, this will enable logs in the browser's console
      }),
    ],
    declarations: [],
    providers:[
    BluetoothLE,
    BluetoothNativeService,
    BluetoothWebService,
    BluetoothService
    ]
  })
  export class BluetoothModule { }