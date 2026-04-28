import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SiteDataService } from '../../services/site-data.service';

interface RegisterPageData {
  form: {
    labels: {
      name: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
    placeholders: {
      name: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
    termsText: string;
    submitText: string;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly siteDataService = inject(SiteDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly defaultRegisterData: RegisterPageData = {
    form: {
      labels: {
        name: 'Nombre',
        lastName: 'Apellidos',
        email: 'Correo electronico',
        password: 'Contrasena',
        confirmPassword: 'Repite contrasena'
      },
      placeholders: {
        name: 'Tu nombre',
        lastName: 'Tus apellidos',
        email: 'Tu correo',
        password: 'Tu contrasena',
        confirmPassword: 'Repite tu contrasena'
      },
      termsText: 'Acepto la politica de privacidad',
      submitText: 'Crear cuenta'
    }
  };

  readonly registerData$ = this.siteDataService.getSection<RegisterPageData>('register').pipe(
    map((data) => data?.form ? data : this.defaultRegisterData),
    catchError(() => of(this.defaultRegisterData))
  );

  formModel = {
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  };
  showPassword1 = false;
  showPassword2 = false;
  errorMessage = '';
  sending = false;

  async submit(): Promise<void> {
    if (this.sending) {
      return;
    }

    this.errorMessage = '';
    this.sending = true;
    if (this.formModel.password !== this.formModel.confirmPassword) {
      this.errorMessage = 'Las contrasenas no coinciden.';
      this.sending = false;
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*]).{6,}$/;
    if (!passwordRegex.test(this.formModel.password)) {
      this.errorMessage =
        'La contrasena debe tener al menos 6 caracteres, una mayuscula, un numero y un caracter especial entre ? ! *';
      this.sending = false;
      return;
    }

    const result = await this.authService.register(this.formModel.email, this.formModel.password, {
      name: this.formModel.name,
      lastName: this.formModel.lastName
    });
    if (!result.ok) {
      this.errorMessage = result.message || 'No se pudo registrar el usuario.';
      this.sending = false;
      return;
    }

    sessionStorage.setItem('app_flash_success', 'Cuenta creada correctamente. Ya puedes iniciar sesion.');
    await this.router.navigateByUrl('/login');
    this.sending = false;
  }
}
