import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CookieService } from 'ngx-cookie-service';

import { BackendInterceptor } from './_interceptors/backendInterceptor';
import { ErrorInterceptor } from './_interceptors/errorInterceptor';
import { JwtInterceptor } from './_interceptors/jwtInterceptor';


import { ErrorService } from './_services/error.service';




@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: 
  [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {
      provide: ErrorHandler,
      useClass: ErrorService,
     },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: BackendInterceptor, multi: true},
    CookieService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {}