import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  IonAlert,
  IonButton,
  IonCheckbox,
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
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    IonContent,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonCheckbox,
    IonAlert,
    IonText,
    IonIcon
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly defaultRegisterData: RegisterPageData = {
    form: {
      labels: {
        name: 'Nombre',
        lastName: 'Apellidos',
        email: 'Correo electr\u00F3nico',
        password: 'Contrase\u00F1a',
        confirmPassword: 'Repite contrase\u00F1a'
      },
      placeholders: {
        name: 'Tu nombre',
        lastName: 'Tus apellidos',
        email: 'Tu correo',
        password: 'Tu contrase\u00F1a',
        confirmPassword: 'Repite tu contrase\u00F1a'
      },
      termsText: 'Acepto la pol\u00EDtica de privacidad',
      submitText: 'Crear cuenta'
    }
  };

  readonly registerData$ = of(this.defaultRegisterData);

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
  successMessage = '';
  showSuccessAlert = false;
  sending = false;
  imagePreview = '';
  selectedFileName = 'Ning\u00FAn archivo seleccionado';

  constructor() {
    addIcons({ eye, eyeOff });
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.selectedFileName = 'Ning\u00FAn archivo seleccionado';
      return;
    }

    this.selectedFileName = file.name;
    const reader = new FileReader();

    this.imagePreview = await new Promise<string>((resolve, reject) => {
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 500;

          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        img.src = String(e.target?.result || '');
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }

  async submit(): Promise<void> {
    if (this.sending) {
      return;
    }

    this.errorMessage = '';
    this.sending = true;

    if (this.formModel.password !== this.formModel.confirmPassword) {
      this.errorMessage = 'Las contrase\u00F1as no coinciden.';
      this.sending = false;
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*]).{6,}$/;
    if (!passwordRegex.test(this.formModel.password)) {
      this.errorMessage =
        'La contrase\u00F1a debe tener al menos 6 caracteres, una may\u00FAscula, un n\u00FAmero y un car\u00E1cter especial entre ? ! *';
      this.sending = false;
      return;
    }

    if (!this.imagePreview) {
      this.errorMessage = 'Debes seleccionar una imagen de perfil.';
      this.sending = false;
      return;
    }

    try {
      const result = await this.authService.register(this.formModel.email, this.formModel.password, {
        name: this.formModel.name,
        lastName: this.formModel.lastName,
        photoDataUrl: this.imagePreview
      });

      if (!result.ok) {
        this.errorMessage = result.message || 'No se pudo registrar el usuario.';
        return;
      }

      this.successMessage = 'Cuenta creada correctamente. Ya puedes iniciar sesi\u00F3n.';
      this.showSuccessAlert = true;
      sessionStorage.setItem('app_flash_success', this.successMessage);
    } catch {
      this.errorMessage = 'Error inesperado de conexi\u00F3n.';
    } finally {
      this.sending = false;
      this.cdr.detectChanges();
    }
  }

  async onSuccessAlertDismiss(): Promise<void> {
    this.showSuccessAlert = false;
    await this.router.navigateByUrl('/login');
  }
}
