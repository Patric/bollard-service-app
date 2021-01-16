import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-found-devices',
  templateUrl: './found-devices.page.html',
  styleUrls: ['./found-devices.page.scss'],
})
export class FoundDevicesPage implements OnInit {


  @Input() devicesFound$;
 @Input()  connectionInfo;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }




  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }


  connect(dvc_address){
    this.modalCtrl.dismiss({
      'disconnectTo': false,
      'connectTo': dvc_address
    });

  }

  disconnect(){
    this.modalCtrl.dismiss({
      'disconnectTo': true,
      'connectTo': false
    });
  }

}
