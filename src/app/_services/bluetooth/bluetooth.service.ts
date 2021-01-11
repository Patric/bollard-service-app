import { Injectable, Injector } from '@angular/core';
import { BluetoothNativeService } from './platform-services/bluetooth-native.service';
import { BluetoothWebService } from './platform-services/bluetooth-web.service';
import { Platform } from '@ionic/angular';
import { BluetoothAbstract } from './platform-services/bluetooth-abstract';





/**
* @description
* BluetoothService adaptet that uses compatible BluetoothService depending on platform.
* Supports Capacitor with iOS and Android
* For PWA check compatibility on https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
* @usage
* ```
* import { BluetoothService } from 'bluetooth.service';
* 
* @Component({
* selector: 'app-bluetooth',
* templateUrl: './bluetooth.component.html',
* styleUrls: ['./bluetooth.component.scss'],
*  })
*   export class BluetoothComponent{
*   constructor(private bluetoothService: BluetoothService){...}
*   exampleFunction(){
*   this.bluetoothService.ready().then(() => {
*   
*   this.bluetoothService.ble.startScanning();
*   
*   })}
}
* 
* 
* ```
*/
@Injectable({
  providedIn: 'root'
})
export class BluetoothService{
  /**
  * @description
  * Getter for Bluetooth services. Needs to be preceded by fulfilled ready() Promise.
  * @usage
  * ```
  * import { BluetoothService } from 'bluetooth.service';
  * 
  * @Component({
  * selector: 'app-bluetooth',
  * templateUrl: './bluetooth.component.html',
  * styleUrls: ['./bluetooth.component.scss'],
  *  })
  *   export class BluetoothComponent{
  *   constructor(private bluetoothService: BluetoothService){...}
  *   exampleFunction(){
  *   this.bluetoothService.ready().then(() => {
  *   
  *   this.bluetoothService.ble.startScanning();
  *    })}
  * }
  * 
  * ```
  * * @returns ```BluetoothAbstract``` service accordingly to current platform
  * 
  */
  public get ble(): BluetoothAbstract{
    
    if(this.platform.is(`mobile`) && this.platform.is(`cordova`) ){
      return this.injector.get(BluetoothNativeService);
    }
    else if(this.platform.is(`mobileweb`) || this.platform.is(`desktop`)){
      return this.injector.get(BluetoothWebService)
    }
    else{
      throw new Error(`Platform ${this.platform.platforms} is unsupported.`);
    }
  }
  constructor(private injector: Injector, private platform: Platform) {}


   /**
  * @description
  * Getter for Bluetooth services
  * @usage
  * ```
  * import { BluetoothService } from 'bluetooth.service';
  * 
  * @Component({
  * selector: 'app-bluetooth',
  * templateUrl: './bluetooth.component.html',
  * styleUrls: ['./bluetooth.component.scss'],
  *  })
  *   export class BluetoothComponent{
  *   constructor(private bluetoothService: BluetoothService){...}
  *   exampleFunction(){
  *   this.bluetoothService.ready().then(() => {
  *   
  *   this.bluetoothService.ble.startScanning();
  *   
  *   })
  *  
  * }
  * }
  * 
  * 
  * ```
  */
  ready(): Promise<string>{
    return this.platform.ready();
   }

 
}
