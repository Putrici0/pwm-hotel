import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
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
      labels: { email: 'Correo electronico', password: 'Contrasena' },
      placeholders: { email: 'Tu correo', password: 'Tu contrasena' },
      primaryButtonText: 'Iniciar sesion',
      secondaryButtonText: 'Crear cuenta',
      forgotPasswordText: 'He olvidado mi contrasena'
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
    this.cdr.detectChanges(); // Pintamos "Validando..."

    try {
      const ok = await this.authService.login(this.email, this.password);

      // Usamos setTimeout(..., 0) para meter la actualización en la cola principal del navegador.
      // Esto obliga a Angular a procesarlo como si hubieras hecho un clic real.
      setTimeout(async () => {
        if (!ok) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu contraseña.';
          this.sending = false;

          // El martillazo final: le gritamos a Angular que repinte
          this.cdr.detectChanges();
          return;
        }

        const destination = this.authService.isAdmin() ? '/admin' : '/account';
        sessionStorage.setItem('app_flash_success', 'Sesión iniciada correctamente.');
        await this.router.navigateByUrl(destination);
        this.sending = false;
        this.cdr.detectChanges();
      }, 0);

    } catch (error) {
      setTimeout(() => {
        this.errorMessage = 'Error inesperado de conexión.';
        this.sending = false;
        this.cdr.detectChanges();
      }, 0);
    }
  }
}
