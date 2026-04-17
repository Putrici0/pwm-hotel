import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SiteDataService } from '../../services/site-data.service';

interface ActivityItem {
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
}

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.css'
})
export class ActivitiesComponent {
  private readonly siteDataService = inject(SiteDataService);

  activities: ActivityItem[] = [
    {
      title: 'Tour guiado por la ciudad',
      description:
        'Recorrido pensado para conocer puntos clave del entorno y descubrir la isla desde una primera toma de contacto cómoda.',
      duration: 'Medio día',
      imageUrl:
        'https://st5.depositphotos.com/5392356/81269/i/600/depositphotos_812697560-stock-photo-friendship-travel-vacation-happiness-summer.jpg'
    },
    {
      title: 'Yoga al amanecer',
      description:
        'Actividad orientada al bienestar físico y mental en un ambiente tranquilo y adecuado para comenzar el día.',
      duration: '1 hora',
      imageUrl:
        'https://st.depositphotos.com/1757635/2010/i/450/depositphotos_20106615-stock-photo-exercises-on-the-beach.jpg'
    },
    {
      title: 'Cata de vinos y productos locales',
      description:
        'Experiencia gastronómica pensada para acercar al huésped a sabores y productos representativos.',
      duration: '2 horas',
      imageUrl:
        'https://st.depositphotos.com/2309453/2618/i/600/depositphotos_26180755-stock-photo-blond-woman-drinking-red-wine.jpg'
    }
  ];

  constructor() {
    this.siteDataService.getImageCatalog()
      .pipe(takeUntilDestroyed())
      .subscribe((catalog) => {
        const activityKeys = [
          'activities-activities-item-1-tour-guiado-por-la-ciudad',
          'activities-activities-item-2-yoga-al-amanecer',
          'activities-activities-item-3-cata-de-vinos-y-productos-locales'
        ];

        this.activities = this.activities.map((activity, index) => ({
          ...activity,
          imageUrl: this.siteDataService.resolveImage(catalog, activityKeys[index], activity.imageUrl)
        }));
      });
  }
}
