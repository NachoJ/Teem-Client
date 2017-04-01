import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

declare const FB: any;

@Component({
  selector: 'te-auth-home',
  templateUrl: './auth-home.component.html',
  styleUrls: ['./auth-home.component.scss']
})
export class AuthHomeComponent implements OnInit {

  fbUserStatus: boolean = false;
  fbUserId: number;
  fbUserName: string;
  fbUserPhotoLink: string;
  fbUserEmail: string;
  fbUserPermissionGranted: boolean = false;
  fbToken: string;

  error: string;
  constructor(private authService: AuthService, private router: Router) {
    FB.init({
      appId: '785727668257883',
      cookie: true,  // enable cookies to allow the server to access the session
      xfbml: true,  // parse social plugins on this page
      version: 'v2.8' // use graph api version 2.8
    });
  }

  ngOnInit() {
  }

  callFbLogin() {
	  console.log("callFbLogin called");
    FB.login((result: any) => {
      console.log('login request', result);
      this.fbToken = result.authResponse.accessToken;
      FB.api('/me/permissions', (result: any) => {
        console.log('permissions', result);
        for (let i = 0; i < result.data.length; i++) {
          if (result.data[i].permission == 'email' && result.data[i].status == 'granted') {
            console.log('permission found')
            FB.api('/me', 'GET', { 'fields': 'id,name,first_name,last_name,email,picture.type(large)' }, (result: any) => {
              console.log('get user data request', result);
              let data = {
                fbid: result.id,
                email: result.email,
                username: (result.first_name + result.last_name).toLowerCase(),
                profileimage: result.picture.data.url
              };
              this.authService.loginFbUser(data)
                .subscribe((response) => {
                  console.log(response)
                  this.error = response.message;
                  window.localStorage['teem_user'] = JSON.stringify(response.data);
                  this.router.navigate(['']);
                },
                (error: any) => {
                  this.error = error;
                  // this._router.navigate(['/login']);
                });
            });
          }
        }
      });
      // return this.fbUserStatus;
    }, { scope: 'email,public_profile', return_scopes: true, auth_type: 'rerequest' });
  }

  mfbLogout() {
    FB.logout((result: any) => {
      console.log(result);
    });
  }


}