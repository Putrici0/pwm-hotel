import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

interface ServiceItem {
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  readonly services: ServiceItem[] = [
    {
      title: 'Instalaciones wellness',
      description:
        'Espacios dedicados al descanso, la desconexión y el cuidado personal durante la estancia.',
      imageUrl:
        'https://st5.depositphotos.com/20397274/81073/i/600/depositphotos_810735234-stock-photo-german-word-aktien-word-written.jpg'
    },
    {
      title: 'Restauración',
      description:
        'Propuesta gastronómica cuidada con opciones equilibradas y menús adaptados a distintos momentos del día.',
      imageUrl:
        'https://st5.depositphotos.com/42736210/69761/i/600/depositphotos_697613704-stock-photo-chic-scandinavian-ambiance-cozy-elegant.jpg'
    },
    {
      title: 'Actividades',
      description:
        'Oferta de ocio para completar la experiencia del huésped dentro y fuera del hotel.',
      imageUrl:
        'https://st.depositphotos.com/1212973/2035/i/600/depositphotos_20355519-stock-photo-active-lifestyle-concept.jpg'
    }
  ];
}
