import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SiteDataService } from '../../services/site-data.service';

interface FacilityItem {
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-wellness-facilities',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './wellness-facilities.component.html',
  styleUrl: './wellness-facilities.component.css'
})
export class WellnessFacilitiesComponent {
  private readonly siteDataService = inject(SiteDataService);

  facilities: FacilityItem[] = [
    {
      title: 'Gimnasio',
      description:
        'Espacio orientado al entrenamiento y mantenimiento de la rutina durante la estancia.',
      imageUrl:
        'https://st5.depositphotos.com/20397274/81073/i/600/depositphotos_810735234-stock-photo-german-word-aktien-word-written.jpg'
    },
    {
      title: 'Piscina',
      description:
        'Zona exterior pensada para el descanso y el disfrute en un ambiente relajado.',
      imageUrl:
        'https://st5.depositphotos.com/20397274/81073/i/600/depositphotos_810735234-stock-photo-german-word-aktien-word-written.jpg'
    },
    {
      title: 'Spa',
      description:
        'Área de bienestar dedicada a la relajación y al cuidado personal.',
      imageUrl:
        'https://st5.depositphotos.com/20397274/81073/i/600/depositphotos_810735234-stock-photo-german-word-aktien-word-written.jpg'
    }
  ];

  constructor() {
    this.siteDataService.getImageCatalog()
      .pipe(takeUntilDestroyed())
      .subscribe((catalog) => {
        const facilityKeys = [
          'wellness-facilities-facilities-item-1-gimnasio',
          'wellness-facilities-facilities-item-2-piscina',
          'wellness-facilities-facilities-item-3-spa'
        ];

        this.facilities = this.facilities.map((facility, index) => ({
          ...facility,
          imageUrl: this.siteDataService.resolveImage(catalog, facilityKeys[index], facility.imageUrl)
        }));
      });
  }
}
