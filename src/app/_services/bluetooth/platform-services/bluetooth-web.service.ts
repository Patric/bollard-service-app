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
      this.message$ = new BehaviorSubject<any>(null);
      this.challenge$ = new BehaviorSubject<any>(null);
      this.connectionInfo$ = new BehaviorSubject<{address: string,name: string, status: STATUS}>({address: null, name: null, status: null});
      this.challenge$.subscribe(challenge => console.log("New challenge: ", challenge));
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
  private PRIMARY_CHARACTERISTIC_UID = Number(peripheral.characteristic.UUID);
  
  private message$: BehaviorSubject<any>;
  private challenge$: BehaviorSubject<any>;

  private response$: Subject<any>;

  connect(dvc_address?: string) {
    //throw new Error('Method not implemented.');
  }

  send(code: number){
   // let subject$ = new Subject();
    // this.watchResponsesFrom(Number(peripheral.characteristic.response), Number(peripheral.characteristic.status)).
    // subscribe(val => {
      
    //   //this.response$.next(val)
    //  subject$.next(val);
    //  // this._characteristics.get(Number(peripheral.characteristic.status)).characteristic.stopNotifications().then(_ => console.log("Notifications stopped"));
    //   //this.stopReadingValue$(Number(peripheral.characteristic.status));
    // }
    
    // );

    
    let message = JSON.stringify({auth: "authCode", code: "433"});
   setTimeout(() =>  {
      this.writeValue(Number(peripheral.characteristic.order), message).then(onfullfilled =>   
        { 
          console.log("Finished writing.") } 
        );
     }, 500);

    return this.response$.pipe(take(1)); //throw new Error('Method not implemented.');
  }


  sendMessage(code: number): Observable<any> {

    this.send(231).subscribe(res => console.log("res from send message: ", res));


    // let message = JSON.stringify({auth: "authCode", code: "433"});
    // setTimeout(() =>  {
    //    this.writeValue(Number(peripheral.characteristic.order), message).then(onfullfilled =>   
    //      { 
    //        console.log("Finished writing.") } 
    //      );
    //   }, 500);
 
     return this.response$.pipe(take(1));
  }
  getConnectionInfo(): Observable<{address: string,name: string, status: STATUS}> {
    return this.connectionInfo$.asObservable();
  }
     
  getDevicesFound(): Observable<any> {
    return of(null); //throw new Error('Method not implemented.');
  }
 

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

    connectToService(service: number){
      return navigator.bluetooth.requestDevice({
        filters: [{
          services: [service]
        }]
      })
      .then(device => {
        device.addEventListener('gattserverdisconnected', this.onDisconnected);
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
      .then(onfulfilled => console.log("Connected to", service))
      .catch(error => { console.error(error); });
    }

    stopReadingValue$(characteristicUID: number){
     this._characteristics.get(characteristicUID).characteristic.stopNotifications()
      .then(characteristic =>{

        characteristic.removeEventListener('characteristicvaluechange', this._characteristics.get(characteristicUID).listener);

        console.log("Removed event listener");
      } );
      
     
    }

    
    // Cannot read two at the same time. When reading is stopped. stopReadingValue$ shall be
    readValue$(characteristicUID: number){
      //let subject$ = new Subject();
     // if(this._characteristics.get(characteristicUID).listener == false){
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

     // }
     // else{

      //  this._characteristics.get(characteristicUID).characteristic.startNotifications().then(_ => console.log("Notification started"));
      //}
    
       return this._characteristics.get(characteristicUID).subject;
      /// return subject$;
    }

   

    
    


    readValue(characteristicUID: number){
      
      return this._characteristics.get(characteristicUID).characteristic.readValue().then(value =>{ 
        
        //console.log("value read:", this.arrayBufferToString(value.buffer));

        //this.message$.next(this.arrayBufferToString(value.buffer));
        return this.arrayBufferToString(value.buffer);
      });
    }


    writeValue(characteristicUID: number, value: string){
      return this._characteristics.get(characteristicUID).characteristic
      .writeValue(this.string2ArrayBuffer(value))
      .then(_ => {
        console.log(value, " has been written.");
      })
      .catch(error => { console.error(error.message); });

    }

    onDisconnected(event){
      const device = event.target;
    
      console.log(`Device ${device.name} is disconnected.`);
    }


    watchResponsesFrom(characteristicUID: number, statusCharacteristicUID: number){
      const subject$ = new Subject<any>();
      this.readValue$(statusCharacteristicUID).subscribe(val =>{
        if(val == "Written"){
           this.readValue(characteristicUID).then(val => subject$.next(val));
        }
      });
    
      return subject$.asObservable();
      
    }


    startScanning(): Observable<{address: string,name: string, status: STATUS}>{
      this.connectToService(this.PRIMARY_SERVICE_UID).then(onfullfilled => {


        this.watchResponsesFrom(Number(peripheral.characteristic.response), Number(peripheral.characteristic.status))
        .subscribe(val => {
          this.response$.next(val);
        });
     //   this.sendMessage(231).subscribe();
        //this.send(231).subscribe(res => console.log("res: ", res));
      }
      );

      return this.connectionInfo$.asObservable();
     }

     debugButton(){
       //this.stopReadingValue$(this.PRIMARY_CHARACTERISTIC_UID).then(characteristic => console.log("Unsubscribed to: ", characteristic));
      //this.readValue(Number(peripheral.characteristic.response)).then(value => console.log("value READ"));
      this.send(231).subscribe(res => console.log("res: ", res));
      //this.stopReadingValue$(Number(peripheral.characteristic.status));
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
