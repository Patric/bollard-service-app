import { Component, OnInit, Input } from '@angular/core';

import { LoginService } from '../login.service';

import { User } from '../user';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @Input() user: User;
  users: User[];

  constructor
  (
    private loginService: LoginService
  ) { }

  ngOnInit() {
    //this. user = new User;
    this.getUsers();
    console.log(`Users fetched`);
  }

  getUsers(): void{
    this.loginService.getUsers().subscribe(users => this.users = users);
  }

  login(email: string, password: string)
  { 
    //this.user.email = "CHECK";
   // console.log(`User ${email} \n password ${password}`);
    
    this.loginService.getUser(1).subscribe(user => this.user = user);
   // console.log(`Fetched credentials from user ${this.user.email}`);
  }

}
