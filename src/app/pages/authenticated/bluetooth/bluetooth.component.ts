import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { BluetoothService } from '../../../_services/bluetooth/bluetooth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {BridgeService} from '../../../_services/bridge.service'
import { ActionSheetController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { filter, switchMap, take } from 'rxjs/operators';
import { FoundDevicesPage } from '../found-devices/found-devices.page';
import { UserService } from 'src/app/_services/user.service';


@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.component.html',
  styleUrls: ['./bluetooth.component.scss']
  
})
export class BluetoothComponent implements OnInit, OnDestroy {

  private response: Observable<Array<any>>;
  
  //Bluetooth variables
  private connectionInfo$: BehaviorSubject<any>;
  private deviceResponse;
  //@Input() code: String;//bou
  private devicesFound$: BehaviorSubject<any>;


  // Scanning modal variable
  private connectTo;

  // Order codes variables
  private orderCodes;

  private messages: Array<{incoming: boolean, source: String, text: String, timestamp: String}>;

  // Toastes
  private connectionToast;
  private restartBluetoothToastVar;
  private messageToast: HTMLIonToastElement;

  // Toggles varbiables
  private showOrderCodes: boolean;
  private showConnectionDetails: boolean;
  private showMessages: boolean;


  // Messages variables
  

  constructor

  ( private bluetoothService: BluetoothService,
    private bridgeService: BridgeService,
    private ngZone: NgZone,
    private toastController: ToastController,
    private modalController: ModalController,
    private userService: UserService
  ) {

    // Initial state
      this.connectionInfo$ = new BehaviorSubject({address: null, name: "null", status: "DISCONNECTED"});
      this.watchConnectonInfo();
      this.devicesFound$ = new BehaviorSubject<any>(null);
      this.connectionInfo$.subscribe(connectionInfo => {
        this.connectionStatusToast();
      })

      this.messages = new Array<{incoming: boolean, source: String, text: String, timestamp: String}>();
   
      // Toggles initital state
      this.showConnectionDetails = true;
      this.showMessages = true;

  }


  getUserCodes(){
    this.userService.getUserOrderCodes().subscribe(orderCodes => 
      this.ngZone.run(()=>{
        this.orderCodes = orderCodes;
      })
      );
  }

  ngOnDestroy(): void {
    //add clearing func
    if(this.connectionInfo$.value.status == "CONNECTED"){
      this.disconnect();
    }
   
  }
  async ngOnInit() {
    await this.bluetoothService.ready();
    this.getUserCodes();
  }
 
  // BLUETOOTH
  watchConnectonInfo(){
    this.bluetoothService.ble.getConnectionInfo().subscribe( (connectionInfo) => {
      this.ngZone.run( () => {
      this.connectionInfo$.next(connectionInfo);
      if(connectionInfo.status == "CONNECTED"){
        this.deviceResponse = null;
      }
    })
    }, err =>{
      console.error("Could not connect to the device.", err);
    
        this.connectionInfo$.next({address: null, name: "null", status: "DISCONNECTED"});
   
    }
    )
  }

  scanDevices() {
    // Start scanning and updating devices found
    this.startScan();
    // If 3 payloads does not give any result do not open modal (nothing to show)
    this.devicesFound$.
      pipe(filter(devicesFound => devicesFound != null))
      .pipe(take(1))
      .subscribe
      (async () => {
       
          const modal = await this.modalController.create({
            component: FoundDevicesPage,
            cssClass: 'my-custom-class',
            swipeToClose: true,
            componentProps: {
              'devicesFound$': this.devicesFound$,
              'connectionInfo': this.connectionInfo$.value
            }
          });
          await modal.present();
          const data = await modal.onDidDismiss();
          console.log("Got data:", JSON.stringify(data.data));
          if (data.data.connectTo) {
            this.connect(data.data.connectTo);
          }
          else if (data.data.disconnectTo) {
            this.disconnect();
          }
        
      })
  }

  async restart(){ 
    this.ngZone.run( () => {
      this.bluetoothService.ble.restart();
    })

    this.restartBluetoothToast();
  
  }

  disconnect(){
    this.bluetoothService.ble.disconnect()//.subscribe( (connectionInfo) => {
      // this.ngZone.run( () => {
      //   console.log("connection Info: ", JSON.stringify(connectionInfo));
      //   this.connectionInfo = connectionInfo;
      // })

      // })

  

  }

  sendMessage(code: String){

    this.ngZone.run( () => {
      this.sentMessageToast(code);
      this.appendChat(false, "Service App", code);
    });

      this.bridgeService.authoriseOrder(code).subscribe(res =>{
        res = JSON.stringify(JSON.parse(res), null, 2);
        res = res.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        this.ngZone.run( () => {
          this.appendChat(true, this.connectionInfo$.value.name, res);
          this.newMessageToast();
          this.showMessages = true;
    
        });
      })

  }

  startScan(){
 
      this.scanningToast();
       this.bluetoothService.ble.startScanning().subscribe((devicesFound) => {
         this.ngZone.run( () => {
        this.devicesFound$.next(devicesFound);
      });
      

    }, 
    (err) => console.error(err));
    
  }
  
  connect(dvc_address: string){
    // this.ngZone.run( () => {
    //   this.connectionInfo = {address: null, name: "null", status: "CONNECTING"};
    // });
      this.bluetoothService.ble.connect(dvc_address);
  }

   // CHAT
   appendChat(incoming: boolean, source: String, text: String){
    this.ngZone.run( () => {
      text = text.split("{").join("").split("}").join("").split("|").join(" | ").split("\"").join("").split(", |").join("\n");

      this.messages.push({incoming: incoming, source: source, text: text, timestamp: String(new Date().toLocaleString() ) });
  
    });
    
  }

  clearChat(){
    delete this.messages;
    this.messages = new Array<{incoming: boolean, source: String, text: String, timestamp: String}>();
  }
 // TOGGLES
 toggleOrderCodes(){
  this.showOrderCodes = !this.showOrderCodes;
}
toggleConnectionDetails(){

  this.showConnectionDetails = !this.showConnectionDetails;
}

toggleMessages(){
  this.showMessages = !this.showMessages;
}
  // TOASTES
  async connectionStatusToast() {
    if(this.connectionToast){
      await this.connectionToast.dismiss();
    }
    
    let message = "Connection status";
;    let header = `${this.connectionInfo$.value.status}`;
    if(this.connectionInfo$.value.name != null && this.connectionInfo$.value.name != undefined){
      header = header + ` to ${this.connectionInfo$.value.name}`;
    }
    if(this.connectionInfo$.value.status == "CONNECTED"){
      message = `Swipe order code right to execute code`
    }
    else if(this.connectionInfo$.value.status == "DISCONNECTED"){
      message = `Scan for devices to connect and execute codes`
    }
    else if(this.connectionInfo$.value.status == "CONNECTING"){
      message = `Please wait...`
    }
    
  
   let duration =  this.connectionInfo$.value.status == "CONNECTING" ? null: 3*1000;

    this.connectionToast = await this.toastController.create({
      header: header,
      message: message,
      position: 'bottom',
      buttons: [
        {
          side: 'start',
          icon: 'bluetooth',
          role: 'cancel'
        }, {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            this.connectionToast.dismiss();
          }
        }
      ],
      duration
    });
    this.connectionToast.present();
  }

  async restartBluetoothToast(){

    this.restartBluetoothToastVar = await this.toastController.create({
      header: "Restarting bluetooth...",
      message: "This operation may take a while.",
      position: 'bottom',
      buttons: [
        {
          side: 'start',
          icon: 'bluetooth',
          role: 'cancel'
        }, {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            this.restartBluetoothToastVar.dismiss();
          }
        }
      ],
      duration: 6*1000
    });
    this.restartBluetoothToastVar.present();
  }

  async newMessageToast(){

    this.messageToast = await this.toastController.create({
      header: `You've received new message from ${this.connectionInfo$.value.name} `,
      //message: "Toggle messages to see it",
      position: 'bottom',
      buttons: [
        {
          side: 'start',
          icon: 'bluetooth',
          role: 'cancel'
        }, {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            this.messageToast.dismiss();
          }
        }
      ],
      duration: 2*1000
    });
    this.messageToast.present();
  }

  async scanningToast(){

    this.connectionToast = await this.toastController.create({
      header: `Scanning has started `,
      message: "Try scanning again if no devices have been found",
      position: 'bottom',
      buttons: [
        {
          side: 'start',
          icon: 'bluetooth',
          role: 'cancel'
        }, {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            this.connectionToast.dismiss();
          }
        }
      ],
      duration: 2*1000
    });
    this.connectionToast.present();
  }

  async sentMessageToast(code?: String){

    let message = (code != undefined && code != null ) ? `CODE ${code}` : null;

    this.messageToast = await this.toastController.create({
      header: `Message sent to ${this.connectionInfo$.value.name} `,
      message: message,
      position: 'bottom',
      buttons: [
        {
          side: 'start',
          icon: 'bluetooth',
          role: 'cancel'
        }, {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            this.messageToast.dismiss();
          }
        }
      ],
      duration: 3*1000
    });
    this.messageToast.present();
  }

  // HELPER
  isEmpty(input): Boolean{
    if(String(input).length > 0){
      return false;
    }
    return true;
  }

  doRefresh(){
  }
}
