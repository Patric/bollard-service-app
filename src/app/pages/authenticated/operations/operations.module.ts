import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OperationsPageRoutingModule } from './operations-routing.module';

import { OperationsPage } from './operations.page';
import { BluetoothComponent } from '../bluetooth/bluetooth.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OperationsPageRoutingModule
  ],
  declarations: [OperationsPage, BluetoothComponent]
})
export class OperationsPageModule {}
