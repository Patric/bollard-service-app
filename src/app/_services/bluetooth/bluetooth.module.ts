import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BluetoothNativeService } from './platform-services/bluetooth-native.service';
import { BluetoothWebService } from './platform-services/bluetooth-web.service';
import { BluetoothService } from './bluetooth.service';



@NgModule({
    imports: [
      CommonModule
    ],
    declarations: [],
    providers:[
    BluetoothNativeService,
    BluetoothWebService,
    BluetoothService
    ]
  })
  export class BluetoothModule { }