declare var google: any; // تعريف مكتبة Google
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { CartsService } from '../../services/carts.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
//  implements AfterViewInit
export class LoginComponent {
  errorMessage: string = '';
  showPassword: boolean = false;
  errorEmail: string = '';

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false),
  });

  constructor(
    private usersService: UsersService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cartsService: CartsService,
    private wishlistService: WishlistService
  ) {}

  onGoogleSignIn() {
    const googleAuthURL = 'http://localhost:8282/auth/google';
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const authWindow = window.open(
      googleAuthURL,
      'Google Sign-In',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    window.addEventListener(
      'message',
      event => {
        if (event.origin !== 'http://localhost:8282') return;
        if (event.data?.token) {
          localStorage.setItem('token', event.data.token);
          const decodedToken = this.decodeJWT(event.data.token);
          if (decodedToken) {
            localStorage.setItem('firstName', decodedToken.firstName);
            localStorage.setItem('userId', decodedToken.id);
            this.router.navigate(['']);
          }
        }
      },
      false
    );
  }

  // ngAfterViewInit() {
  //   if (typeof google !== 'undefined' && google.accounts) {
  //     google.accounts.id.initialize({
  //       client_id:'377025698351-uhgf9ibv0nqlt4mgl43tdptkvb8k10oa.apps.googleusercontent.com',
  //       callback: (response: any) => this.handleGoogleSignIn(response),
  //     });

  //   } else {
  //     console.error("Google API is not loaded yet.");
  //   }
  // }

  // handleGoogleSignIn(response: any) {
  //   console.log('Google response:', response);

  //   const token = response.credential;
  //   if (token) {
  //     localStorage.setItem('google_token', token);
  //     this.usersService.verifyGoogleToken(token).subscribe({
  //       next: res => {
  //         console.log('Login successful:', res);
  //         localStorage.setItem('token', res.token);
  //         this.router.navigate(['']);
  //       },
  //       error: err => {
  //         console.error('Login failed:', err);
  //         this.errorMessage = 'Login failed. Please try again.';
  //         this.cdr.detectChanges();
  //       },
  //     });
  //   }
  // }

  // onGoogleSignIn() {
  //   google.accounts.id.prompt();
  // }

  ngOnInit() {
    this.loadRememberedUser();
  }

  getEmailError(): string {
    const emailControl = this.loginForm.get('email');

    if (emailControl?.hasError('required')) {
      return 'This field is required';
    } else if (emailControl?.hasError('email')) {
      return 'Invalid email format';
    }

    return '';
  }

  getPasswordError(): string {
    const passwordControl = this.loginForm.get('password');

    if (passwordControl?.hasError('required')) {
      return 'This field is required';
    }

    return '';
  }

  login() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return; // Stop submission if form is invalid
    }

    const { email, password, rememberMe } = this.loginForm.value;

    this.usersService.login(email, password).subscribe({
      next: res => {
        const data = res.body;
        if (data.token) {
          this.usersService.logintoken(data.token);

          const decodedToken = this.decodeJWT(data.token);
          let userData;
          this.usersService
            .getUserById(decodedToken.id, data.token)
            .subscribe(response => {
              userData = response.user;
              if (userData && userData._id) {
                localStorage.setItem('userId', userData._id);
              }

              if (userData.image && userData.image.imageUrl)
                localStorage.setItem(
                  'profileImageUrl',
                  userData.image.imageUrl
                );
              window.location.href = '';
            });
          localStorage.setItem('firstName', decodedToken.firstName);
          // Remeber Me
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
            localStorage.setItem('rememberedPassword', btoa(password));
          } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
          }
        } else {
          this.errorEmail = 'Invalid email or password.';
        }
      },
      error: err => {
        if (err.status === 400) {
          // Unauthorized
          this.errorEmail = 'Invalid email or password.';
        } else if (err.status === 404) {
          this.errorMessage =
            'This email is not registered. Please sign up first.';
        } else if (err.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
        console.error('Login error', err);
        this.cdr.detectChanges();
      },
    });
  }

  loadRememberedUser() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedEmail && savedPassword) {
      this.loginForm.patchValue({
        email: savedEmail,
        password: atob(savedPassword),
        rememberMe: true,
      });
    }
  }

  decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }
  //////////////////////
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
/////////////////////////////////
