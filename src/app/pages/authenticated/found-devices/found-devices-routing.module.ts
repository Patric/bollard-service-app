import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FoundDevicesPage } from './found-devices.page';

const routes: Routes = [
  {
    path: '',
    component: FoundDevicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoundDevicesPageRoutingModule {}
