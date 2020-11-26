import { Injectable } from '@angular/core';
import { BluetoothCore, BrowserWebBluetooth} from '@manekinekko/angular-web-bluetooth';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { peripheral } from './bluetooth.config.json'


@Injectable({
  providedIn: 'root'
})
export class BluetoothWebService {


  private PRIMARY_SERVICE_UID = Number(peripheral.service.UUID);
  private PRIMARY_CHARACTERISTIC_UID = Number(peripheral.characteristic.UUID);

  private remoteGATTServer: BluetoothRemoteGATTServer;
  private remoteGATTCharacteristic: BluetoothRemoteGATTCharacteristic;
  
  private message$: BehaviorSubject<any>;

  constructor(
    public readonly ble: BluetoothCore,
    ) {
      this.message$ = new BehaviorSubject<any>(null);
     }

    startScanning(){
     // console.log(Number("0x1101"));
    
      
      this.ble.streamValues$().pipe(
        map(value => value.getInt8(0)))
        .subscribe(value => 
          {
            //console.log("Value", value)
            this.message$.next(value);
          }
          );
      
    // eAasy way
    //   this.ble.value$({
    //     service: 0x1101,
    //     characteristic: 0x2101
    //   }).subscribe(value => console.log("Value: ", this.arrayBufferToString(value)));
    
      this.getValue$().subscribe(value => console.log("Value from getValue ", this.arrayBufferToString(value)));
     }

     getMessage(){

      
      //this.message$.subscribe((value)=>console.log("New message in getMessage"));
      //console.log("Returning message observable");
      return this.message$;
     }


    getValue$(){
    console.log("Getting value...");
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

    disconnect(){
      this.ble.disconnectDevice();
    }

    arrayBufferToString(buffer){

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


}
