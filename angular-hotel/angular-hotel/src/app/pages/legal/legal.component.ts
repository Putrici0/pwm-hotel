import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './legal.component.html'
})
export class LegalComponent {
  private readonly siteDataService = inject(SiteDataService);
  readonly legalData$ = this.siteDataService.getSection<any>('legal');

  get legalDateLabel(): string {
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
    return `Ultima actualizacion: ${formattedDate}`;
  }
}
