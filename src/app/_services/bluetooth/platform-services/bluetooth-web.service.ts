import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { peripheral } from '../config/bluetooth.config.json'
import {BluetoothAbstract, STATUS} from './bluetooth-abstract';


@Injectable({
  providedIn: 'root'
})
export class BluetoothWebService implements BluetoothAbstract{


  private device: BluetoothDevice;
  constructor(

    ) {
      this.message$ = new BehaviorSubject<any>(null);
      this.challenge$ = new BehaviorSubject<any>(null);
      this.connectionInfo$ = new BehaviorSubject<{address: string,name: string, status: STATUS}>({address: null, name: null, status: null});
      this.challenge$.subscribe(challenge => console.log("New challenge: ", challenge));
      //this._characteristics = new Map<number, BluetoothRemoteGATTCharacteristic>();
     }
  connectionInfo$: BehaviorSubject<{address: string,name: string, status: STATUS}>;

  private PRIMARY_SERVICE_UID = Number(peripheral.service.UUID);
  private PRIMARY_CHARACTERISTIC_UID = Number(peripheral.characteristic.UUID);
  
  private message$: BehaviorSubject<any>;
  private challenge$: BehaviorSubject<any>;


  private bluetoothRemoteGATTService: BluetoothRemoteGATTService;

  connect(dvc_address?: string) {
    //throw new Error('Method not implemented.');
  }

  sendMessage(code: number): Observable<any> {
    let message = JSON.stringify({auth: "authCode", code: "433"});
    this.writeValue(this.bluetoothRemoteGATTService, Number(peripheral.characteristic.peripheralAuthUUID), message).then(onfullfilled => 
      
      {
        console.log("Finished writing.")
        this.readValue(this.bluetoothRemoteGATTService, Number(peripheral.characteristic.peripheralAuthUUID)).then(val => console.log("Auth char: ", val));
        
      
      }
      
      );
   

    return of(null); //throw new Error('Method not implemented.');
  }
  getConnectionInfo(): Observable<{address: string,name: string, status: STATUS}> {
    return this.connectionInfo$.asObservable();
  }
     
  getDevicesFound(): Observable<any> {
    return of(null); //throw new Error('Method not implemented.');
  }
 

    connectToService(service: number[]){
      return navigator.bluetooth.requestDevice({
        filters: [{
          services: service
        }]
      })
      .then(device => {
        device.addEventListener('gattserverdisconnected', this.onDisconnected);
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => server.getPrimaryService(this.PRIMARY_SERVICE_UID))
      .then(service => {
        this.bluetoothRemoteGATTService = service;
        //this._cacheCharacteristic(service, Number(peripheral.characteristic.UUID));
        //this._cacheCharacteristic(service, Number(peripheral.characteristic.peripheralAuthUUID));
        setTimeout(() =>  {  return service; }, 10);
        
      })
      .catch(error => { console.error(error); });
    }

    stopReadingValue$(service: BluetoothRemoteGATTService, characteristicUID: number){
      return service.getCharacteristic(characteristicUID)
      .then(characteristic => characteristic.stopNotifications()
      .then(characteristic => characteristic));
    }

    // Cannot read two at the same time
    readValue$(service: BluetoothRemoteGATTService, characteristicUID: number){
      let subject$ = new Subject<any>();
      service.getCharacteristic(characteristicUID)
      .then(characteristic => {characteristic.startNotifications()
        .then(characteristic => characteristic.addEventListener('characteristicvaluechanged', (e: any) => {
          const value = e.target.value;
          let result = "";
          let Uint = new Uint8Array(value.buffer);
          for(let i =0; i< Uint.length; i++){
            result += String.fromCharCode(Uint[i]);
          }
          subject$.next(result);
        }))
        console.log("Subscribed to: ", characteristic);
      }); 
      return subject$.asObservable();
    }


    readValue(service: BluetoothRemoteGATTService, characteristicUID: number){
      return service.getCharacteristic(characteristicUID)
      .then(characteristic => characteristic.readValue().then(value =>{ 
        
        console.log("value read", this.arrayBufferToString(value.buffer));

        //this.message$.next(this.arrayBufferToString(value.buffer));
        return this.arrayBufferToString(value.buffer);
      }));
    }



    writeValue(service: BluetoothRemoteGATTService, characteristicUID: number, value: string){
      return service.getCharacteristic(characteristicUID)
      .then(characteristic => {
        
        // Writing 1 is the signal to reset energy expended.
        //const resetEnergyExpended = Uint8Array.of(1);
        return characteristic.writeValue(this.string2ArrayBuffer(value));
      })
      .then(_ => {
        console.log(value, " has been written.");
      })
      .catch(error => { console.error(error); });

    }

    onDisconnected(event){
      const device = event.target;
      console.log(`Device ${device.name} is disconnected.`);
    }



    startScanning(): Observable<{address: string,name: string, status: STATUS}>{


      this.connectToService([this.PRIMARY_SERVICE_UID]).then(onfullfilled => {
        this.readValue$(this.bluetoothRemoteGATTService, this.PRIMARY_CHARACTERISTIC_UID).subscribe(val => this.message$.next(val));
        
        
      }
      );

      return this.connectionInfo$.asObservable();
     }

     debugButton(){
       this.stopReadingValue$(this.bluetoothRemoteGATTService, this.PRIMARY_CHARACTERISTIC_UID).then(characteristic => console.log("Unsubscribed to: ", characteristic));
     }

     getMessage(){
      return this.message$;
     }



    disconnect(): Observable<{address: string,name: string, status: STATUS}>{
      this.device.gatt.disconnect();
      return this.connectionInfo$.asObservable();
    }

  

    string2ArrayBuffer(string: string): ArrayBuffer{

      return (new Uint8Array([].map.call(string, x =>{
     
        return x.charCodeAt(0)
    }
    ))).buffer;
    }    


    arrayBufferToString(buffer: ArrayBuffer): string{
      let result = "";
      let Uint = new Uint8Array(buffer);
      for(let i =0; i< Uint.length; i++){
        result += String.fromCharCode(Uint[i]);
        
      }
      return result;
    }

}
