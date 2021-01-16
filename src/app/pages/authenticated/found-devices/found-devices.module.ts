import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoundDevicesPageRoutingModule } from './found-devices-routing.module';

import { FoundDevicesPage } from './found-devices.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FoundDevicesPageRoutingModule
  ],
  declarations: [FoundDevicesPage]
})
export class FoundDevicesPageModule {}
