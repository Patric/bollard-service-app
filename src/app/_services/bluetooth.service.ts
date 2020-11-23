import { Injectable } from '@angular/core';
import { BluetoothLE, DeviceInfo, ScanStatus } from '@ionic-native/bluetooth-le/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, Observer, of, throwError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  scanStatus: ScanStatus;
  devicesFound: Array<any>;
  devicesFound$: BehaviorSubject<Array<any>>;
  deviceInfo$: BehaviorSubject<any>;
  message$: BehaviorSubject<any>;

constructor(public bluetoothle: BluetoothLE, public plt: Platform) {


  this.devicesFound = new Array();
  this.devicesFound$ = new BehaviorSubject<Array<any>>(this.devicesFound);
  this.deviceInfo$ = new BehaviorSubject<any>(null);
  this.message$ = new BehaviorSubject<any>(null);
  // this.bluetoothle.retrieveConnected().then((retrieved) => {
  //   this.deviceInfo$ = new BehaviorSubject(retrieved.devices[1]);
  // });
  
  

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
   // this.bluetoothle.retrieveConnected().then(status => console.log(status.devices));

  }


  startScanning(){
    //this.closeConnection(this.deviceInfo$.getValue().dvc_address);
    // Add all connected devices to scanning list
    
    this.bluetoothle.retrieveConnected().then((connected) => 
    {
      
      console.log("Devices connected:", connected.devices);
      connected.devices.forEach((device: any) => 
      {
      this.devicesFound$.next(device);
      console.log("Devices connected:", device);
    
    })});
 


    this.bluetoothle.isScanning().then((status) => {
      console.log(status.isScanning);

    if(!status.isScanning){
    this.devicesFound = [];
    console.log(this.devicesFound);
    const stop_scan = new Date();
    stop_scan.setSeconds(stop_scan.getSeconds() + 3);
    //this.stopScanning();

    
    this.bluetoothle.startScan({
      //"services": ["1101"], // error when connecting to different devices
      "allowDuplicates": true,  
      "scanMode": this.bluetoothle.SCAN_MODE_LOW_LATENCY,
      "matchMode": this.bluetoothle.MATCH_MODE_AGGRESSIVE,
      "matchNum": this.bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
      "callbackType": this.bluetoothle.CALLBACK_TYPE_ALL_MATCHES,
    }).subscribe((deviceInfo) => {
      if(deviceInfo.status == "scanResult"){
        if(this.devicesFound.find(x => x.address == deviceInfo.address && x.name == deviceInfo.name)){}
        else{
          this.devicesFound.push(deviceInfo);
        };
      }
      const myDate = new Date();
      if(myDate.toString().substring(11, 30) == stop_scan.toString().substring(11,30)){
        this.stopScanning();
      }
    
      this.devicesFound$.next(this.devicesFound);
    });
   }});


  }

  stopScanning(){
   
    this.bluetoothle.isScanning().then((status) => {
      if(status.isScanning){
        this.bluetoothle.stopScan().then(m => console.log(m));
      };

      
      // if(status.isScanning && !this.isStopPlanned)
      // {
        
      //   setTimeout(()=>{
      //     console.log("clicked");
      //     this.bluetoothle.stopScan().then(m => console.log(m));
      //     this.isStopPlanned = false;
      //   }, 600);
      // this.isStopPlanned = true;
      // }
    });
  }

  getDevicesFound(): BehaviorSubject<Array<any>>{
    return this.devicesFound$;
  }
  getConnectedDevices(): BehaviorSubject<any>{
    return this.deviceInfo$;
  }
  getMessage(): BehaviorSubject<any>{
    return this.message$;
  }


  connect(dvc_address: string)
  {

    this.deviceInfo$.next("connecting");
    this.bluetoothle.isConnected({address: dvc_address}).then((deviceInfo) =>

    {  this.deviceInfo$.next(deviceInfo);
      //console.log("IS connected?",deviceInfo.isConnected);
      if(deviceInfo.isConnected){
        //this.closeConnection(dvc_address);
        console.log("Already connected");

     //   return this.deviceInfo$;
      }
    });

    console.log("Connecting initiated");
    this.bluetoothle.connect(
      {
        address: dvc_address,
        autoConnect: false
      }
    ).subscribe((deviceInfo) =>  {
    
    //console.log("NEW CONNECTION STATUS: ", deviceInfo.status)
    
    
    if(deviceInfo.status == "connected"){
      
      this.bluetoothle.discover({
        "address": deviceInfo.address,
        "clearCache": true
      }).then((onfulfilled) => {
        
        this.deviceInfo$.next(deviceInfo);
        
        console.log("New value: ", this.deviceInfo$.value);
        this.read();
        console.log("Services: ", onfulfilled.services);
        
    });
      
    };
    
    }, (err) => 
    {
      if(err.message == "Device previously connected, reconnect or close for new device"){
      
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
    
    
    // if(this.cntnStatus$.getValue() != ""){
    //   return of(this.error(this.cntnStatus$.getValue()));
    // }

   // return this.deviceInfo$;
    
  }

  read(){
    console.log("reading...", this.deviceInfo$.getValue());

    // this.bluetoothle.retrieveConnected().then((retrieved) => {
    //   this.deviceInfo$.next(retrieved.devices[1]);

    // });
   
    // this.bluetoothle.read(
    //   {
    //     "address": this.deviceInfo$.getValue().address,
    //     "service": "1101",
    //     "characteristic": "2101"
    //   }
    // ).then((res) => {
      
    //   console.log(this.bluetoothle.encodedStringToBytes(res.value));
    //   this.message$.next(this.bluetoothle.encodedStringToBytes(res.value));
    // });

    this.bluetoothle.subscribe({
      "address": this.deviceInfo$.getValue().address,
      "service": "1101",
      "characteristic": "2101",
    }).subscribe((onfulfilled) => 
    {
   
      let value = onfulfilled.value;
      //let base64 new Base64();
     // console.log(base64.decode(String(decoded)));
     // console.log(this.bluetoothle.encodedStringToBytes("Kg=="));
     // console.log(`This is decoded ${decoded}`);
      //decoded = base64.decode(String(decoded));
    
      if(value != undefined){
        //onsole.log(this.bluetoothle.encodedStringToBytes(`${value}`));
        this.message$.next(this.bluetoothle.encodedStringToBytes(`${value}`));
      }
      
    });

    
  }
  
  closeConnection(dvc_address: string)
  {
    console.log("closing");
    this.bluetoothle.close(
      {
        address: dvc_address
      }
    ).then((deviceInfo) =>  {
     this.deviceInfo$.next(deviceInfo.status);
     }
     );
   
    //  if(this.cntnStatus$.getValue() != ""){
    //    return of(this.error(this.cntnStatus$.getValue()));
    //  }
     return this.deviceInfo$;
  }

  


  //helper functions

  error(message: string){
    return throwError ({error: { message }})
  }

 // bollard sending to device it's data. Device making request to serwer to get data for this bollard
  

}
