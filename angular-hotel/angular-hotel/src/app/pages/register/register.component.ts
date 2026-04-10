import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly siteDataService = inject(SiteDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly registerData$ = this.siteDataService.getSection<any>('register');

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

  async submit(): Promise<void> {
    this.errorMessage = '';
    if (this.formModel.password !== this.formModel.confirmPassword) {
      this.errorMessage = 'Las contrasenas no coinciden.';
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*]).{6,}$/;
    if (!passwordRegex.test(this.formModel.password)) {
      this.errorMessage =
        'La contrasena debe tener al menos 6 caracteres, una mayuscula, un numero y un caracter especial entre ? ! *';
      return;
    }

    const result = await this.authService.register(this.formModel.email, this.formModel.password);
    if (!result.ok) {
      this.errorMessage = result.message || 'No se pudo registrar el usuario.';
      return;
    }

    await this.router.navigateByUrl('/login');
  }
}
