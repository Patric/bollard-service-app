import { Component, OnInit, Input, NgZone } from '@angular/core';
import { User } from '../../_models/user';
import { AuthService } from '../../_services/auth.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {



  private error;
  constructor
  (
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private ctrlNav: NavController,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
 
  }


  login($email: string, $pass: string)
  { 
    this.authService.authenticate($email, $pass).subscribe((response) => 
    {
  
      if(response.token){
        this.ctrlNav.navigateRoot([`/authenticated`]);
      }
      else{
        this.ngZone.run(()=>{
          this.error = response.error;

        })
     
      }
    }
    );

  }

}
