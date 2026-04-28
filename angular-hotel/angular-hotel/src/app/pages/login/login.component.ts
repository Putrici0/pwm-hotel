import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SiteDataService } from '../../services/site-data.service';

interface LoginPageData {
  form: {
    labels: { email: string; password: string };
    placeholders: { email: string; password: string };
    primaryButtonText: string;
    secondaryButtonText: string;
    forgotPasswordText: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly siteDataService = inject(SiteDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly defaultLoginData: LoginPageData = {
    form: {
      labels: {
        email: 'Correo electronico',
        password: 'Contrasena'
      },
      placeholders: {
        email: 'Tu correo',
        password: 'Tu contrasena'
      },
      primaryButtonText: 'Iniciar sesion',
      secondaryButtonText: 'Crear cuenta',
      forgotPasswordText: 'He olvidado mi contrasena'
    }
  };

  readonly loginData$ = this.siteDataService.getSection<LoginPageData>('login').pipe(
    map((data) => data?.form ? data : this.defaultLoginData),
    catchError(() => of(this.defaultLoginData))
  );

  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  sending = false;

  async submit(): Promise<void> {
    if (this.sending) {
      return;
    }

    this.errorMessage = '';
    this.sending = true;
    const ok = await this.authService.login(this.email, this.password);
    if (!ok) {
      this.errorMessage = 'Credenciales incorrectas. Intentalo de nuevo.';
      this.sending = false;
      return;
    }

    const destination = this.authService.isAdmin() ? '/admin' : '/account';
    sessionStorage.setItem(
      'app_flash_success',
      this.authService.isAdmin()
        ? 'Sesion iniciada correctamente. Bienvenido al panel de administracion.'
        : `Sesion iniciada correctamente. Bienvenido${this.authService.getLoggedUserDisplayName() ? `, ${this.authService.getLoggedUserDisplayName()}` : ' de nuevo'}.`
    );
    await this.router.navigateByUrl(destination);
    this.sending = false;
  }
}
