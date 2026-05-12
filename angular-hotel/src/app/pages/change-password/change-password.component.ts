import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, IonContent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly changeData$ = of({
    step1: {
      title: 'Recuperar contrasena',
      description: 'Introduce tu correo para validar que existe una cuenta.',
      labelEmail: 'Correo electronico',
      placeholderEmail: 'Tu correo',
      btnText: 'Continuar'
    },
    step2: {
      title: 'Verifica el codigo',
      description: 'Introduce el codigo de verificacion de prueba.',
      labelCode: 'Codigo',
      placeholderCode: 'Codigo de 6 digitos',
      btnText: 'Verificar'
    },
    step3: {
      title: 'Nueva contrasena',
      description: 'Define tu nueva contrasena.',
      labelPass1: 'Nueva contrasena',
      placeholderPass1: 'Escribe la nueva contrasena',
      labelPass2: 'Repite la contrasena',
      placeholderPass2: 'Repite la nueva contrasena',
      btnText: 'Actualizar contrasena'
    }
  });

  step = 1;
  targetEmail = '';
  code = '';
  pass1 = '';
  pass2 = '';
  error1 = '';
  error2 = '';
  error3 = '';
  showPass1 = false;
  showPass2 = false;

  async submitStep1(): Promise<void> {
    this.error1 = '';
    const exists = await this.authService.emailExists(this.targetEmail.trim());
    if (!exists) {
      this.error1 = 'El correo electronico no esta registrado.';
      return;
    }
    this.step = 2;
  }

  submitStep2(): void {
    this.error2 = '';
    if (this.code !== '123456') {
      this.error2 = 'Codigo incorrecto. El codigo de prueba es 123456.';
      return;
    }
    this.step = 3;
  }

  async submitStep3(): Promise<void> {
    this.error3 = '';
    if (this.pass1 !== this.pass2) {
      this.error3 = 'Las contrasenas no coinciden.';
      return;
    }

    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*]).{6,}$/;
    if (!regex.test(this.pass1)) {
      this.error3 =
        'La contrasena debe tener al menos 6 caracteres, una mayuscula, un numero y un caracter especial (? ! *).';
      return;
    }

    try {
      await this.authService.updatePassword(this.targetEmail.trim(), this.pass1);
      await this.router.navigateByUrl('/login');
    } catch {
      this.error3 =
        'No se pudo actualizar la contrasena desde aqui. Si no has iniciado sesion, usa el correo de recuperacion.';
    }
  }
}
