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

  async submit(): Promise<void> {
    this.errorMessage = '';
    const ok = await this.authService.login(this.email, this.password);
    if (!ok) {
      this.errorMessage = 'Credenciales incorrectas. Intentalo de nuevo.';
      return;
    }

    if (this.authService.isAdmin()) {
      await this.router.navigateByUrl('/admin');
      return;
    }

    await this.router.navigateByUrl('/account');
  }
}
