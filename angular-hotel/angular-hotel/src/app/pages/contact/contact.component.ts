import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  private readonly siteDataService = inject(SiteDataService);

  commitmentImage =
    'https://static6.depositphotos.com/1087752/606/i/600/depositphotos_6060530-stock-photo-handshake.jpg';

  constructor() {
    this.siteDataService.getImageCatalog()
      .pipe(takeUntilDestroyed())
      .subscribe((catalog) => {
        this.commitmentImage = this.siteDataService.resolveImage(
          catalog,
          'contact-commitment-compromiso-de-atencion-al-huesped',
          this.commitmentImage
        );
      });
  }
}
