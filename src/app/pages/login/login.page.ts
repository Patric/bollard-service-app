import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../_models/user';
import { AuthService } from '../../_services/auth.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private user: Observable<User>;


  constructor
  (
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
 
  }


  login($email: string, $pass: string)
  { 
    //this.loginService.fakeBackendTest();

    //this.loginService.validate($email, $pass); ------------------------------<--
    //returns user
    this.authService.authenticate($email, $pass).subscribe((user) => 
    {
      this.user = user;
      if(user.token){
        this.router.navigate([`/authenticated`]);
      }
      
    }
    );
    
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
