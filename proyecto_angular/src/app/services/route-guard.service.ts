import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';


@Injectable({
  providedIn: 'root'
})
export class RouteGuardService {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  canActivate() {
    if (this.authenticationService.isUserLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
