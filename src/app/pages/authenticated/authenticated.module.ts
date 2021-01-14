import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthenticatedPageRoutingModule } from './authenticated-routing.module';

import { AuthenticatedPage } from './authenticated.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthenticatedPageRoutingModule
  ],
  declarations: [AuthenticatedPage]
})
export class AuthenticatedPageModule {}
