import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';
import { BluetoothModule } from './bluetooth/bluetooth.module';
import { BluetoothComponent } from './bluetooth/bluetooth.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    BluetoothModule
  ],
  declarations: [ProfilePage, BluetoothComponent]
})
export class ProfilePageModule {}
