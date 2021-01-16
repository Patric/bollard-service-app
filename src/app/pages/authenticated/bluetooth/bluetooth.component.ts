import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../_services/auth.service';

import { environment } from '../../../../environments/environment';

import { BluetoothService } from '../../../_services/bluetooth/bluetooth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {BridgeService} from '../../../_services/bridge.service'
import { ActionSheetController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { filter, switchMap, take } from 'rxjs/operators';
import { FoundDevicesPage } from '../found-devices/found-devices.page';


@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.component.html',
  styleUrls: ['./bluetooth.component.scss']
  
})
export class BluetoothComponent implements OnInit, OnDestroy {

  private response: Observable<Array<any>>;
  
  //isNaN: Function = Number.isNaN;
  // Bonding with html
  private connectionInfo$: BehaviorSubject<any>;
  private deviceResponse;
  //@Input() code: String;//bou
  private devicesFound$: BehaviorSubject<any>;
  private connectTo;

  private orderCodes;




  private predefinedCodes: boolean;
  private connecionToast;


  constructor

  ( private bluetoothService: BluetoothService,
    private http: HttpClient,
    private bridgeService: BridgeService,
    private router: Router,
    private ngZone: NgZone,
    private injector: Injector,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    
      this.connectionInfo$ = new BehaviorSubject({address: null, name: "null", status: "DISCONNECTED"});
      this.watchConnectonInfo();
      this.devicesFound$ = new BehaviorSubject<any>(null);
      this.connectionInfo$.subscribe(connectionInfo => {
        this.connectionStatusToast();
      })

      this.orderCodes = [
        {
          value: "202",
          name: "DOWNLOAD BOLLARD'S DATA",
          description:"Downloads details from the device.",
          icon: 'arrow-down'
        },
        {
          value: "101",
          name: "LOCK BOLLARD",
          description:"Locks bollard.",
          icon: 'lock-closed-outline'
        },
        {
          value: "102",
          name: "UNLOCK BOLLARD",
          description:"Unlocks bollard.",
          icon: 'lock-open-outline'
        }
    
    
    
      ];



  }
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

  ngOnDestroy(): void {
    //add clearing func
    if(this.connectionInfo$.value.status == "CONNECTED"){
      this.disconnect();
    }
   
  }


  async ngOnInit() {
    await this.bluetoothService.ready();
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

  togglePredefinedCodes(){
    this.predefinedCodes = !this.predefinedCodes;
  }

  
  async presentScanResults() {
    this.bluetoothService.ble.startScanning().subscribe((devicesFound) => {
     this.devicesFound$.next(devicesFound);
 

 }, 
 (err) => console.error(err));
        
  const loading = await this.loadingController.create({
    spinner: 'circles',
    duration: 1000*2,
    message: 'Scanning...',
    translucent: true,
    cssClass: 'custom-class custom-loading',
    backdropDismiss: true
  });
  await loading.present();

  const { role, data } = await loading.onDidDismiss();
  console.log('Loading dismissed with role:', role);



    let buttons = Array();

    for(let deviceFound of this.devicesFound$.value){
      if(deviceFound.name == null){
        deviceFound.name = "unnamed";
      }
      
      if((deviceFound.address != null && this.connectionInfo$.value.address!= null) && deviceFound.address == this.connectionInfo$.value.address){
        buttons.push({
          text: deviceFound.name + " (Connected)"+ ` [${deviceFound.address}]`,
          icon: 'checkmark-circle-outline',
          handler: () => {
            console.log("Disconnecting from", deviceFound.name);
          }
          })

      }
      else{
        buttons.push({
          text: deviceFound.name+ ` [${deviceFound.address}]`,
          icon: 'close-circle-outline',
          handler: () => {
            console.log("Connectng to ", deviceFound.name);
          }
          })
      }

   
    }

    buttons.push({
      text: 'Refresh',
      icon: 'refresh',
      role: 'destructive',
      handler: () => {
        console.log('Refreshing');
      }
    });


    buttons.push({
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    });


    console.log("FOR LOOP HERE");
    for(let i =0; i < 40; i++){

      buttons.push({
        text: "Bollard_#00 "+String(i),
        icon: 'close-circle-outline',
        handler: () => {
          console.log('Cancel clicked');
        }
      });
    }
    
    const actionSheet = await this.actionSheetController.create({
      header: 'Found devices',
      cssClass: 'scan-result-actionsheet',
      buttons: buttons
    });
    await actionSheet.present();
  }


  async restart(){ 
    const toast = await this.toastController.create({
      message: 'Restarting Bluetooth...',
      duration: 2000
    });
    toast.present();

    this.ngZone.run( () => {
    this.bluetoothService.ble.restart();
  })
  
  }


 
  disconnect(){
    this.bluetoothService.ble.disconnect()//.subscribe( (connectionInfo) => {
      // this.ngZone.run( () => {
      //   console.log("connection Info: ", JSON.stringify(connectionInfo));
      //   this.connectionInfo = connectionInfo;
      // })

      // })

  

  }

  logEvent(){
    this.http.get
    (
      `${environment.apiUrl}/someInfo`,
      // map emits a new transformed observable, pipe used to combine functions
      // store user details and jwt token in local storage to keep user logged in between page refreshes
    ).subscribe((res: any) =>{
      // if(res.status == "401"){
      //   this.router.navigateByUrl(this.router.getCurrentNavigation.toString());
      // }

      console.log(res);
      this.response = res.users;
      
    } );
  
  }

  sendMessage(code: String){
  
    console.log("Sending code: ", JSON.stringify(code));
      this.bridgeService.authoriseOrder(Number(code)).subscribe(res =>{
        console.log("Authorizing order status: ", res);
        res = JSON.stringify(JSON.parse(res), null, 2);
        res = res.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        this.ngZone.run( () => {this.deviceResponse = res;});
      })

  }

 
  startScan(){

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

  isEmpty(input): Boolean{
    if(String(input).length > 0){
      return false;
    }
    return true;
  }

 
  async connectionStatusToast() {
    if(this.connecionToast){
      await this.connecionToast.dismiss();
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

    this.connecionToast = await this.toastController.create({
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
            this.connecionToast.dismiss();
          }
        }
      ],
      duration
    });
    this.connecionToast.present();
  }



}
