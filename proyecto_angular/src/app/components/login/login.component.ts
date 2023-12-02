import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  errorMessage = 'Error al iniciar sesión, verifique la información ingresada';
  errorLogin = false;
  
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(7)]]
    });
  }
  ngOnInit(): void {
    this.authenticationService.logout()
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login() {
    this.authenticationService.login(this.username?.value, this.password?.value)
      .pipe(
        catchError((error) => {
          console.error('Error al intentar iniciar sesión:', error);
          this.errorLogin = true;
          return of(null);
        })
      )
      .subscribe((data) => {
        if (data === null) {
          console.error('Error al intentar iniciar sesión:');
          this.errorLogin = true;
        } else {
          this.router.navigate(['/dashboard/model']);
          this.errorLogin = false;
        }
      });
  }
}
