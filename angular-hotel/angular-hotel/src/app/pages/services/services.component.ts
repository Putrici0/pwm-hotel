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
  services: ServiceItem[] = [
    {
      title: 'Instalaciones wellness',
      description:
        'Espacios dedicados al descanso, la desconexion y el cuidado personal durante la estancia.',
      imageUrl:
        'https://static9.depositphotos.com/1007593/1127/i/600/depositphotos_11276642-stock-photo-luxury-place-resort.jpg'
    },
    {
      title: 'Restauracion',
      description:
        'Propuesta gastronomica cuidada con opciones equilibradas y menus adaptados a distintos momentos del dia.',
      imageUrl:
        'https://st.depositphotos.com/1518767/3618/i/600/depositphotos_36186243-stock-photo-work-surface-and-kitchen-equipment.jpg'
    },
    {
      title: 'Actividades',
      description:
        'Oferta de ocio para completar la experiencia del huesped dentro y fuera del hotel.',
      imageUrl:
        'https://st.depositphotos.com/1518767/3618/i/600/depositphotos_36186243-stock-photo-work-surface-and-kitchen-equipment.jpg'
    }
  ];
}
