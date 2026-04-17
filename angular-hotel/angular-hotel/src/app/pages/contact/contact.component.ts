import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formModel = {
    name: '',
    lastName: '',
    email: '',
    subject: '',
    question: '',
    privacy: false
  };

  errorMessage = '';
  successMessage = '';
  submitting = false;

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: string[] = [];

    if (!this.formModel.name.trim()) {
      errors.push('Por favor, introduce tu nombre.');
    }

    if (!this.formModel.lastName.trim()) {
      errors.push('Por favor, introduce tus apellidos.');
    }

    if (!emailRegex.test(this.formModel.email)) {
      errors.push('Por favor, introduce un correo electronico valido.');
    }

    if (!this.formModel.subject) {
      errors.push('Por favor, selecciona un asunto.');
    }

    if (this.formModel.question.trim().length < 20) {
      errors.push('Tu mensaje es demasiado corto. Por favor, escribe al menos 20 caracteres.');
    }

    if (!this.formModel.privacy) {
      errors.push('Debes aceptar el tratamiento de datos para continuar.');
    }

    if (errors.length > 0) {
      this.errorMessage = errors.join('\n');
      return;
    }

    this.submitting = true;

    setTimeout(() => {
      this.formModel = {
        name: '',
        lastName: '',
        email: '',
        subject: '',
        question: '',
        privacy: false
      };

      this.submitting = false;
      this.successMessage =
        'Mensaje enviado con exito. Hemos recibido tu consulta y te responderemos en breve.';
    }, 1500);
  }
}
