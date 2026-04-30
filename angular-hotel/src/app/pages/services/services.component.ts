import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- IMPORTANTE: Para que funcionen los enlaces
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

interface ServiceItem {
  title: string;
  description: string;
  imageUrl: string;
  route: string; // <-- Añadimos la ruta a la interfaz
}

@Component({
  selector: 'app-services',
  standalone: true,
  // Añadimos RouterModule a los imports
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  services: ServiceItem[] = [
    {
      title: 'Instalaciones wellness',
      description:
        'Espacios dedicados al descanso, la desconexión y el cuidado personal durante la estancia.',
      imageUrl:
        'https://iacolumna.com/wp-content/uploads/elementor/thumbs/pexels-elina-fairytale-3823039-scaled-pzv9lv8lkb3fr4f6leacd15a2mhgik985ic151liq8.webp',
      route: '/wellness-facilities' // <-- La ruta a Bienestar
    },
    {
      title: 'Restauración',
      description:
        'Saborea una oferta gastronómica variada con menú diario, cocina canaria y opciones internacionales preparadas con producto fresco.',
      imageUrl:
        'https://estaticos-cdn.prensaiberica.es/clip/8a0d81b5-85f6-4aa8-b5b7-4243941e795b_alta-libre-aspect-ratio_default_0.jpg',
      route: '/restaurant' // <-- La ruta al Restaurante
    },
    {
      title: 'Actividades',
      description:
        'Completa tu viaje en Gran Canaria con actividades dentro y fuera del hotel, desde propuestas familiares hasta planes de aventura y ocio al aire libre.',
      imageUrl:
        'https://s2.elespanol.com/2021/07/19/ocio/597701105_195651748_1706x1280.jpg',
      route: '/activities' // <-- La ruta a Actividades
    }
  ];
}
