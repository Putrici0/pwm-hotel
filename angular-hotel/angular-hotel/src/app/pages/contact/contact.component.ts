import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TextImageSectionComponent } from '../../components/text-image-section/text-image-section.component';
import { TitleSubtitleComponent } from '../../components/title-subtitle/title-subtitle.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    TitleSubtitleComponent,
    TextImageSectionComponent
  ],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private readonly siteDataService = inject(SiteDataService);
  readonly contactData$ = this.siteDataService.getSection<any>('contact');

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

    if (!emailRegex.test(this.formModel.email)) {
      errors.push('Por favor, introduce un correo electronico valido.');
    }

    if (this.formModel.question.trim().length < 20) {
      errors.push('Tu mensaje es demasiado corto. Por favor, escribe al menos 20 caracteres.');
    }

    if (errors.length > 0) {
      this.errorMessage = errors.join('\n');
      return;
    }

    this.submitting = true;
    setTimeout(() => {
      this.formModel = { name: '', lastName: '', email: '', subject: '', question: '', privacy: false };
      this.submitting = false;
      this.successMessage =
        'Mensaje enviado con exito. Hemos enviado un resumen a tu correo y te responderemos en breve.';
    }, 1500);
  }
}
