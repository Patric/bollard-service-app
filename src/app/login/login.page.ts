import { Component, OnInit, Input } from '@angular/core';

import { LoginService } from '../_services/login.service';

import { User } from '../_models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  user: User;
  users: User[];

  constructor
  (
    private loginService: LoginService
  ) { }

  ngOnInit() {
    this.user = new User;
  }


  login($email: string, $pass: string)
  { 
    //this.loginService.fakeBackendTest();
    this.loginService.validate($email, $pass);
    // console.log(`User: ${email} \n password: ${password} ${this.user}`);
    
    // if(this.user.email != undefined)
    // {
    //   console.log(`Fetched credentials from user ${this.user.email}`);
    // }
    // else
    // {
    //   console.log(this.loginService.validate(email, password).subscribe(user => this.user = user));
    // }

  }

}
