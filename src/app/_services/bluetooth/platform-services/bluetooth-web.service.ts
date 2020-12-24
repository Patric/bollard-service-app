import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { last, map, mergeMap, take } from 'rxjs/operators';
import { peripheral } from '../config/bluetooth.config.json'
import {BluetoothAbstract, STATUS} from './bluetooth-abstract';


@Injectable({
  providedIn: 'root'
})
export class BluetoothWebService implements BluetoothAbstract{


  private device: BluetoothDevice;
  constructor(
    ) {
      this.connectionInfo$ = new BehaviorSubject<{address: string,name: string, status: STATUS}>({address: null, name: null, status: null});
      this.response$ = new Subject<any>();
      this._characteristics = new Map<number, {
        characteristic: BluetoothRemoteGATTCharacteristic,
        subject: BehaviorSubject<any>,
        listener: any
      }>();
     }

  connectionInfo$: BehaviorSubject<{address: string,name: string, status: STATUS}>;
  private _characteristics: Map<number, {
    characteristic: BluetoothRemoteGATTCharacteristic,
    subject: BehaviorSubject<any>,
    listener: any
  }>;

  private PRIMARY_SERVICE_UID = Number(peripheral.service.UUID);
  private response$: Subject<any>;

  startScanning(): Observable<{address: string,name: string, status: STATUS}>{
    this._connectToService(this.PRIMARY_SERVICE_UID).then(_ => {
      this._watchResponsesFrom(Number(peripheral.characteristic.response), Number(peripheral.characteristic.status))
      .subscribe(val => {
        this.response$.next(val);
      });
    }
    );
    return this.connectionInfo$.asObservable();
    }

  connect(dvc_address?: string) {
    //throw new Error('Method not implemented.');
  }

  order(body: string): Observable<any>{
    setTimeout(() =>  {
       this._writeValue(Number(peripheral.characteristic.order), body).then(_ =>   
         { 
           console.log("Order sent.") } 
         );
      }, 500);
      //alternatively first(response => response.header == orderhearder)
     return this.response$.pipe(take(1)); //throw new Error('Method not implemented.');
  }

  getConnectionInfo(): Observable<{address: string,name: string, status: STATUS}> {
    //T O BE IMPLEMENTED
    return this.connectionInfo$.asObservable();
  }
     
  // EMPTY IMPLEMENTATION
  getDevicesFound(): Observable<any> {
    
    return of(null); //throw new Error('Method not implemented.');
  }
 
    debugButton(){
       //this.stopReadingValue$(this.PRIMARY_CHARACTERISTIC_UID).then(characteristic => console.log("Unsubscribed to: ", characteristic));
      //this.readValue(Number(peripheral.characteristic.response)).then(value => console.log("value READ"));
      this.order(JSON.stringify({auth: "authCode", code: 432})).subscribe(res => console.log("res: ", res));
      //this.stopReadingValue$(Number(peripheral.characteristic.status));
      }

    disconnect(): Observable<{address: string,name: string, status: STATUS}>{
      this.device.gatt.disconnect();
      return this.connectionInfo$.asObservable();
    }

    // helper functions

    _cacheCharacteristic(service, characteristicUuid): Promise<boolean> {
      return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        this._characteristics.set(characteristicUuid, {
          characteristic: characteristic,
          subject: new BehaviorSubject<any>(null),
          listener: false
        
        })
        return service;
      });
    }
  
    _connectToService(service: number){
      return navigator.bluetooth.requestDevice({
        filters: [{
          services: [service]
        }]
      })
      .then(device => {
        device.addEventListener('gattserverdisconnected', this._onDisconnected);
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => server.getPrimaryService(service))
      .then(service => {
        //this.bluetoothRemoteGATTService = service;
        this._cacheCharacteristic(service, Number(peripheral.characteristic.order));
        this._cacheCharacteristic(service, Number(peripheral.characteristic.response));
        return this._cacheCharacteristic(service, Number(peripheral.characteristic.status));
      })
      .then(_ => console.log("Connected to", service))
      .catch(error => { console.error(error); });
    }
  
    // Does not work (?)
    _stopReadingValue$(characteristicUID: number){
      this._characteristics.get(characteristicUID).characteristic.stopNotifications()
      .then(characteristic =>{
        characteristic.removeEventListener('characteristicvaluechange', this._characteristics.get(characteristicUID).listener);
        console.log("Removed event listener");
      } );
    }

    
    // Cannot read two at the same time. When reading is stopped. stopReadingValue$ shall be called
    _readValue$(characteristicUID: number){
        this._characteristics.get(characteristicUID).listener = (e: any) => {
          const value = e.target.value;
          let result = "";
          let Uint = new Uint8Array(value.buffer);
          for(let i =0; i< Uint.length; i++){
            result += String.fromCharCode(Uint[i]);
          }
          this._characteristics.get(characteristicUID).subject.next(result);
        }

        this._characteristics.get(characteristicUID).characteristic.startNotifications()
        .then(characteristic => characteristic.addEventListener('characteristicvaluechanged', this._characteristics.get(characteristicUID).listener))
        console.log("Added listener to: ", this._characteristics.get(characteristicUID));
    
        return this._characteristics.get(characteristicUID).subject;
    }


    _readValue(characteristicUID: number){
      
      return this._characteristics.get(characteristicUID).characteristic.readValue().then(value =>{ 
        
        //console.log("value read:", this.arrayBufferToString(value.buffer));

        //this.message$.next(this.arrayBufferToString(value.buffer));
        return this._arrayBufferToString(value.buffer);
      });
    }


    _writeValue(characteristicUID: number, value: string){
      return this._characteristics.get(characteristicUID).characteristic
      .writeValue(this._string2ArrayBuffer(value))
      .then(_ => {
        console.log(value, " has been written.");
      })
      .catch(error => { console.error(error.message); });

    }

    _onDisconnected(event){
      const device = event.target;
    
      console.log(`Device ${device.name} is disconnected.`);
    }

    _watchResponsesFrom(characteristicUID: number, statusCharacteristicUID: number){
      const subject$ = new Subject<any>();
      this._readValue$(statusCharacteristicUID).subscribe(val =>{
        if(val == "Written"){
            this._readValue(characteristicUID).then(val => subject$.next(val));
        }
      });
    
      return subject$.asObservable();
      
    }

    _string2ArrayBuffer(string: string): ArrayBuffer{

      return (new Uint8Array([].map.call(string, x =>{
     
        return x.charCodeAt(0)
    }
    ))).buffer;
    }    

    _arrayBufferToString(buffer: ArrayBuffer): string{
      let result = "";
      let Uint = new Uint8Array(buffer);
      for(let i =0; i< Uint.length; i++){
        result += String.fromCharCode(Uint[i]);
        
      }
      return result;
    }

}
