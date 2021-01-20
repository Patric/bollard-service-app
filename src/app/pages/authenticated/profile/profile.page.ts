
import {  Component, NgZone, OnInit } from '@angular/core';

import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

 

  private userDetails;
  private photoUrl;

  constructor
  ( 
    private ngZone: NgZone,
    private userService: UserService
  ) {

  }

  ngOnInit() {
    this.userService.getUserData().subscribe(userDetails => {
      this.ngZone.run(() => { 
        this.userDetails = userDetails;
        console.log("userDetails: ", userDetails);
      })
    })
  }

 


}
