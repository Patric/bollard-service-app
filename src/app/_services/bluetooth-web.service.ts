import { Injectable } from '@angular/core';
import { BluetoothCore, BrowserWebBluetooth} from '@manekinekko/angular-web-bluetooth';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { peripheral} from './bluetooth.config.json';


@Injectable({
  providedIn: 'root'
})
export class BluetoothWebService {

  //UID in AxAAAA format
  private PRIMARY_SERVICE_UID = Number(peripheral.service.UUID);
  private PRIMARY_CHARACTERISTIC_UID = Number(peripheral.characteristic.UUID);

  private remoteGATTServer: BluetoothRemoteGATTServer;
  private remoteGATTCharacteristic: BluetoothRemoteGATTCharacteristic;
  
  private message$: Observable<any>;

  constructor(
    public readonly ble: BluetoothCore,
    ) {
      
     }

    startScanning(){
     // console.log(Number("0x1101"));
      this.ble.streamValues$().pipe(
        map(value => value.getInt8(0))).
          pipe(
            map(value => (this.arrayBufferToString(value))))
              .subscribe(value => console.log("GOT A NEW VALUE: ", value));
      
    // eAasy way
    //   this.ble.value$({
    //     service: 0x1101,
    //     characteristic: 0x2101
    //   }).subscribe(value => console.log("Value: ", this.arrayBufferToString(value)));
        this.message$ = this.getValue$().pipe(map(value => (this.arrayBufferToString(value)))); //subscribe(value => console.log("Value: ", this.arrayBufferToString(value)));
     }

     getMessage(){
       return this.message$;
     }

  

    disconnect(){
      this.ble.disconnectDevice();
    }

    private arrayBufferToString(buffer){

      var Uint = new Uint16Array(buffer);
      var len = Uint.length;
      var result = '';
      var addition = Math.pow(2,16)-1;
      for(var i = 0;i<length;i+=addition){
  
          if(i + addition > len){
              addition = len - i;
          }
          result += String.fromCharCode.apply(null, Uint.subarray(i,i+addition));
      }
      return result;
  
  }

  private getValue$(){
    let options = {
            filters: [
            {services: [this.PRIMARY_SERVICE_UID]},
            ]
             // ,acceptAllDevices: true
            };
    return this.ble
          // 1) call the discover method will trigger the discovery process (by the browser)
          .discover$(options)
          .pipe(
  
            // 2) get that service
            mergeMap((gatt: BluetoothRemoteGATTServer) => {
              
              return this.ble.getPrimaryService$(gatt, this.PRIMARY_SERVICE_UID);
            }),
  
            // 3) get a specific characteristic on that service
            mergeMap((primaryService: BluetoothRemoteGATTService) => {
             // console.log(primaryService.uuid);
              return this.ble.getCharacteristic$(primaryService, this.PRIMARY_CHARACTERISTIC_UID);
            }),
  
            // 4) ask for the value of that characteristic (will return a DataView)
            mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
              return this.ble.readValue$(characteristic);
            }),
  
            // 5) on that DataView, get the right value
            map((value: DataView) => value.getUint8(0))
          )
    }


}
