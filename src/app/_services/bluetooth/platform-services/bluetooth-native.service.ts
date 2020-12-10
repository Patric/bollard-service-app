import { Injectable } from '@angular/core';
import { BluetoothLE, DeviceInfo} from '@ionic-native/bluetooth-le/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, Observer, of, throwError } from 'rxjs';
import { peripheral } from '../config/bluetooth.config.json'
import { BluetoothAbstract, ConnectionStatus } from './bluetooth-abstract';


@Injectable({
  providedIn: 'root'
})
export class BluetoothNativeService implements BluetoothAbstract{

  //UID in AAAA format, not AxAAAA
  private PRIMARY_SERVICE_UID = peripheral.service.UUID.substring(2);
  private PRIMARY_CHARACTERISTIC_UID = peripheral.characteristic.UUID.substring(2);

  connectionStatus$: Observable<ConnectionStatus>;
  devicesFound: Array<any>;
  devicesFound$: BehaviorSubject<Array<any>>;
  bluetoothDevice$: BehaviorSubject<any>;
  message$: BehaviorSubject<any>;

constructor(
  public bluetoothle: BluetoothLE, 
  public plt: Platform) {


  this.devicesFound = new Array();
  this.devicesFound$ = new BehaviorSubject<Array<any>>(this.devicesFound);

  this.connectionStatus$ = new BehaviorSubject<ConnectionStatus>(new ConnectionStatus(null, null, ConnectionStatus.status.CLOSED));
 
  this.bluetoothDevice$ = new BehaviorSubject<any>({address: null, name: null, status: "closed"});
  this.message$ = new BehaviorSubject<any>(null);


  console.log("Initiating bluetooth");
  this.plt.ready().then((readySource) => {
 

    console.log('Platform ready from', readySource);
    
    this.bluetoothle.hasPermission().then((response) => {
      if(response.hasPermission == false){

        this.bluetoothle.requestPermission().then(status => console.log(status));
      }
    });

    bluetoothle.isLocationEnabled().then((isLocationEnabled) => {
      console.log(isLocationEnabled);
      if(!isLocationEnabled){
        this.bluetoothle.requestLocation().then(status => console.log(status));
      }

    });
    this.bluetoothle.initialize({
      "request": true, // request = true / false (default) - Should user be prompted to enable Bluetooth
      "statusReceiver": true, // Should change in Bluetooth status notifications be sent.
      "restoreKey" : "bluetoothleplugin" // A unique string to identify your app. Bluetooth Central background mode is required to use this, but background mode doesn't seem to require specifying the restoreKey.
      
    }).subscribe(ble => {
      console.log('ble', ble.status) // logs 'enabled'
      this.bluetoothle.enable();
      this.bluetoothle.getAdapterInfo().then(info => console.log(info));
    });
   });
 }

  checkStatus(){
    console.log("CHECK");

  }

  read(){
    console.log("reading...", this.bluetoothDevice$.getValue());
    
    this.bluetoothle.subscribe({
      "address": this.bluetoothDevice$.getValue().address,
      "service": this.PRIMARY_SERVICE_UID,
      "characteristic": this.PRIMARY_CHARACTERISTIC_UID,
    }).subscribe((onfulfilled) => 
    {
   
      let value = onfulfilled.value;
    
    
      if(value != undefined){
        this.message$.next(this.bluetoothle.encodedStringToBytes(`${value}`));
      }
      
    });

    
  }

  // Ensure device is not scanning all the time. Check after 2 seconds from the scanning start
  superviseScan(){
    const seconds = 2;
    const interval_id = setInterval(() => {
      this.bluetoothle.isScanning().then((status) => {

        if(status.isScanning){
          this.stopScanning();
        }
        else{
          console.log("Interval for isScanning stopped");
          clearInterval(interval_id);
        }
      });
      // miliseconds
    }, 1000*seconds);
  }


  stopScanning(){
    
    this.bluetoothle.isScanning().then((status) => {
      if(status.isScanning){
        this.bluetoothle.stopScan().then(m => console.log("Stopped scanning ", m));

      };
    });


  }

  // INTERFACE BLUETOOTHABSTRACT =====================================================================================
  startScanning(){
   
    this.bluetoothle.isScanning().then((status) => {
      console.log("Is scanning =", status.isScanning);

    if(!status.isScanning){
    this.superviseScan();
    this.devicesFound = [];
    console.log("Devices found:", this.devicesFound);

    this.bluetoothle.startScan({
      "services": [this.PRIMARY_SERVICE_UID], // bugs when connecting to different devices or services
      "allowDuplicates": true,  
      "scanMode": this.bluetoothle.SCAN_MODE_LOW_LATENCY,
      "matchMode": this.bluetoothle.MATCH_MODE_AGGRESSIVE,
      "matchNum": this.bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
      "callbackType": this.bluetoothle.CALLBACK_TYPE_ALL_MATCHES,
    }).subscribe((deviceInfo) => {
        
      // Avoid duplicates during 2 secs scan
      if(deviceInfo.status == "scanResult"){
        if(this.devicesFound.find(x => x.address == deviceInfo.address && x.name == deviceInfo.name)){}
        else{
          this.devicesFound.push(deviceInfo);
        };
      }
      this.devicesFound$.next(this.devicesFound);
    });
   }
  });


  }

  connect(dvc_address: string)
  {
    
    this.bluetoothDevice$.next({address: null, name: null, status: "connecting"});
    //this.bluetoothDevice$.next("connecting");
    console.log("DEVICEINFO", JSON.stringify(this.bluetoothDevice$.value));
    // this.bluetoothle.isConnected({address: dvc_address}).then((deviceInfo) =>
    // { this.bluetoothDevice$.next(deviceInfo);
    //   //console.log("IS connected?",deviceInfo.isConnected);
    //   if(deviceInfo.isConnected){
    //     //this.closeConnection(dvc_address);
    //     console.log("Already connected");

    //  //   return this.deviceInfo$;
    //   }
    // });

    console.log("Connecting initiated");
    this.bluetoothle.connect(
      {
        address: dvc_address,
        autoConnect: false
      }
    ).subscribe((deviceInfo) =>  {
    
    //console.log("NEW CONNECTION STATUS: ", deviceInfo.status)
    console.log("Device info before writing", JSON.stringify(deviceInfo));
    
    if(deviceInfo.status == "connected"){
      
      this.bluetoothle.discover({
        "address": deviceInfo.address,
        "clearCache": true
      }).then((onfulfilled) => {
      
        this.bluetoothDevice$.next(deviceInfo);
        console.log("DEVICEINFO", JSON.stringify(this.bluetoothDevice$.value));

        this.read();
        console.log("Services: ", JSON.stringify(onfulfilled.services));
        
    });
      
    }
    else if(deviceInfo.status == "closed"){
      this.bluetoothDevice$.next({status: deviceInfo});
      console.log("DEVICEINFO", JSON.stringify(this.bluetoothDevice$.value));
    };
    
    }, (err) => 
    {
      if(err.message == "Device previously connected, reconnect or close for a new device"){
      
        this.bluetoothle.close({
          address: err.address
          }).then((onfullfilled) => {
            console.log(onfullfilled);
            if(onfullfilled.status == "closed"){
              this.connect(dvc_address);
            }
          }
          );;

      console.log("Function connect() failed: ", err);
          

    }
    }
    );
  }



  request(code: number): Observable<any>{
      return of(null);
  }

  getMessage(): Observable<any>{
    return this.message$.asObservable();
  }

  getConnectedDevice(): Observable<any>{
    return this.bluetoothDevice$.asObservable();
  }

  getDevicesFound(): Observable<Array<any>>{
    return this.devicesFound$.asObservable();
  }
  
  disconnect(): Promise<any>{
      return null;
  }

  
  closeConnection(dvc_address: string)
  {
    console.log("closing");

    this.bluetoothle.disconnect(
      {
      address: dvc_address
      }
    )
    .then((deviceInfo) =>  {
      this.bluetoothDevice$.next(deviceInfo.status);
      }
      );;

    this.bluetoothle.close(
      {
        address: dvc_address
      }
    ).then((deviceInfo) =>  {
     this.bluetoothDevice$.next(deviceInfo.status);
     }
     );
   
    
     return this.bluetoothDevice$.asObservable();
  }

  


  //helper functions

  error(message: string){
    return throwError ({error: { message }})
  }

 // bollard sending to device it's data. Device making request to serwer to get data for this bollard
  

}
