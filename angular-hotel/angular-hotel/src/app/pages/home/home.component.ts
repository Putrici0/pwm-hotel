import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface CardItem {
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  readonly introImage =
    'https://st.depositphotos.com/1001203/3353/i/600/depositphotos_33534605-stock-photo-swimming-pool-and-building-of.jpg';

  readonly islandImage =
    'https://st4.depositphotos.com/12052680/38846/i/600/depositphotos_388465436-stock-photo-landscape-puerto-mogan-gran-canaria.jpg';

  readonly locationImage =
    'https://st3.depositphotos.com/1005233/19549/i/600/depositphotos_195497640-stock-photo-view-businessman-holding-rendering-pin.jpg';

  readonly roomsImage =
    'https://st3.depositphotos.com/9880800/16871/i/600/depositphotos_168711620-stock-photo-exhausted-businessman-lying-on-bed.jpg';

  readonly services: CardItem[] = [
    {
      title: 'Wellness',
      description:
        'Espacios de relax, piscina y zonas pensadas para el bienestar durante toda la estancia.',
      imageUrl:
        'https://st5.depositphotos.com/20397274/81073/i/600/depositphotos_810735234-stock-photo-german-word-aktien-word-written.jpg',
      link: '/wellness-facilities'
    },
    {
      title: 'Restauración',
      description:
        'Cocina equilibrada, propuestas variadas y una experiencia gastronómica cuidada.',
      imageUrl:
        'https://st5.depositphotos.com/42736210/69761/i/600/depositphotos_697613704-stock-photo-chic-scandinavian-ambiance-cozy-elegant.jpg',
      link: '/restaurant'
    },
    {
      title: 'Actividades',
      description:
        'Planes para descubrir la isla, desconectar y completar la experiencia más allá del hotel.',
      imageUrl:
        'https://st.depositphotos.com/1212973/2035/i/600/depositphotos_20355519-stock-photo-active-lifestyle-concept.jpg',
      link: '/activities'
    }
  ];

  readonly environmentItems: CardItem[] = [
    {
      title: 'Eficiencia energética',
      description:
        'Trabajamos para optimizar el consumo energético con criterios de sostenibilidad y mantenimiento responsable.',
      imageUrl:
        'https://st5.depositphotos.com/17357706/64422/i/600/depositphotos_644221886-stock-photo-environmental-protection-renewable-sustainable-energy.jpg'
    },
    {
      title: 'Consumo responsable de agua',
      description:
        'Promovemos un uso racional del agua mediante hábitos de ahorro y sistemas de control del consumo.',
      imageUrl:
        'https://static4.depositphotos.com/1015060/494/i/600/depositphotos_4949128-stock-photo-child-hands-holding-globe-green.jpg'
    },
    {
      title: 'Gestión de residuos',
      description:
        'Fomentamos la separación y correcta gestión de residuos para reducir el impacto ambiental del alojamiento.',
      imageUrl:
        'https://st.depositphotos.com/1229718/3570/i/600/depositphotos_35703041-stock-photo-recycle-garbage-concept.jpg'
    }
  ];
}
