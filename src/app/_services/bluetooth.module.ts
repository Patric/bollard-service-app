import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BluetoothNativeService } from './bluetooth-native.service';
import { BluetoothWebService } from './bluetooth-web.service';
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