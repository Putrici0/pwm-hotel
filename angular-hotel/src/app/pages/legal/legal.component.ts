import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, IonContent],
  templateUrl: './legal.component.html'
})
export class LegalComponent {
  get legalDateLabel(): string {
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());

    return `Ultima actualizacion: ${formattedDate}`;
  }
}
