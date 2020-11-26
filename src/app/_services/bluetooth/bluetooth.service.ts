import { Injectable, Injector } from '@angular/core';
import { BluetoothNativeService } from './platform-services/bluetooth-native.service';
import { BluetoothWebService } from './platform-services/bluetooth-web.service';
import { Platform } from '@ionic/angular';
import { of } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  
  
  private mode;
  private _bluetoothNativeService: BluetoothNativeService;
  private _bluetoothWebService: BluetoothWebService;


  // instantiate native service for android/iOS
  // get metod is called only when methods from bluetoothNativeService are called thus bluetoothNativeService is not instantiated instantly(lazy loading?)
  public get bluetoothNativeService(): BluetoothNativeService{
    if(!this._bluetoothNativeService){
      this._bluetoothNativeService = this.injector.get(BluetoothNativeService);
    }
    return this._bluetoothNativeService;
  }


  // Instantiate webservice for browsers
  public get bluetoothWebService(): BluetoothWebService{
    if(!this._bluetoothWebService){
      this._bluetoothWebService = this.injector.get(BluetoothWebService);
    }
    return this._bluetoothWebService;
  }



  constructor(private injector: Injector, private platform: Platform) {

    this.platform.ready().then(()=>{
      // consider using ios/android distinction
      if(this.platform.is(`mobile`) && !this.platform.is(`mobileweb`)){
        console.log("Loading bluetooth in native mode.");
        this.mode = "native";
      }
      else if(this.platform.is(`mobileweb`) || this.platform.is(`desktop`)){
      
        console.log("Loading bluetooth in browser mode.");
        this.mode = "browser";
      }

      
    })
   }
   //android mobile mobileweb

  canInitiateBluetooth(){
    return this.platform.ready();
   }

  startScanning(){
    
    if(this.mode == "native"){
      console.log("Scanning launched in native platform");
      this.bluetoothNativeService.startScanning();
    }
    else if(this.mode == "browser"){
      console.log("Scanning launched in browser platform");
      this.bluetoothWebService.startScanning();
    
    }
    else{
        this.throwError();
        return null;
     // return throwError ({error: { message: `Platform ${this.platform.platforms} is unsupported.` }})
    }
  }

  getDevicesFound(){
    if(this.mode == "native"){
      console.log("getDevices launched in native platform");
      return this.bluetoothNativeService.getDevicesFound();
    }
    else if(this.mode == "browser"){
      return of(null);
    }
    else{
      this.throwError();
      return null;
      
    }
  }

  getMessage(){
    if(this.mode == "native"){
      return this.bluetoothNativeService.getMessage();
    }
    else if(this.mode == "browser"){
      return this.bluetoothWebService.getMessage();
    }
    else{
      this.throwError();
      return null;
      
    }
  }

  getConnectedDevices(){

    if(this.mode == "native"){
      console.log("GetConnectedDevices launched in native platform");
      return this.bluetoothNativeService.getConnectedDevices();
    }
    else if(this.mode == "browser"){
      return of(null);
    }
    else{
      this.throwError();
      return null;
      
    }
  }

  connect(dvc_address: string){
    if(this.mode == "native"){
      this.bluetoothNativeService.connect(dvc_address);
    }
    else if(this.mode == "browser"){
      // DO NOTHING
    }
    else{
      this.throwError();
      return null;
      
    }
  }

  stopScanning(){
    if(this.mode == "native"){
      this.bluetoothNativeService.stopScanning();
    }
    else if(this.mode == "browser"){
      // DO NOTHING
    }
    else{
      this.throwError();
      return null;
      
    }
  }

  closeConnection(address){
    if(this.mode == "native"){
      return this.bluetoothNativeService.closeConnection(address);
    }
    else if(this.mode == "browser"){
     // DO NOTHING
    }
    else{
      this.throwError();
      return null;
      
    }
  }

  disconnect(){
    if(this.mode == "native"){
      // DO NOTHING
    }
    else if(this.mode == "browser"){
      this.bluetoothWebService.disconnect();
    }
    else{
      this.throwError();
      return null;
      
    }
  }

  throwError(){
    throw new Error(`Platform ${this.platform.platforms} is unsupported.`);
  }


}
