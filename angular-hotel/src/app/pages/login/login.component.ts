import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    IonContent,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonIcon
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loginData = {
    form: {
      labels: { email: 'Correo electr\u00F3nico', password: 'Contrase\u00F1a' },
      placeholders: { email: 'Tu correo', password: 'Tu contrase\u00F1a' },
      primaryButtonText: 'Iniciar sesi\u00F3n',
      secondaryButtonText: 'Crear cuenta',
      forgotPasswordText: 'He olvidado mi contrase\u00F1a'
    }
  };

  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  sending = false;

  constructor() {
    addIcons({ eye, eyeOff });
  }

  async submit(): Promise<void> {
    if (this.sending) return;

    this.errorMessage = '';
    this.sending = true;
    this.cdr.detectChanges();

    try {
      const ok = await this.authService.login(this.email, this.password);

      setTimeout(async () => {
        if (!ok) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu contrase\u00F1a.';
          this.sending = false;
          this.cdr.detectChanges();
          return;
        }

        const destination = this.authService.isAdmin() ? '/admin' : '/account';
        sessionStorage.setItem('app_flash_success', 'Sesi\u00F3n iniciada correctamente.');
        await this.router.navigateByUrl(destination);
        this.sending = false;
        this.cdr.detectChanges();
      }, 0);
    } catch {
      setTimeout(() => {
        this.errorMessage = 'Error inesperado de conexi\u00F3n.';
        this.sending = false;
        this.cdr.detectChanges();
      }, 0);
    }
  }
}
