import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

interface RoomCard {
  title: string;
  description: string;
  capacity: string;
  size: string;
  priceFrom: string;
  imageUrl: string;
  features: string[];
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent {
  readonly rooms: RoomCard[] = [
    {
      title: 'Suite Mar Premium',
      description:
        'Habitación amplia orientada a una experiencia superior, ideal para quienes priorizan amplitud, confort y una estancia más exclusiva.',
      capacity: '2 personas',
      size: '45 m²',
      priceFrom: 'Desde 220 € / noche',
      imageUrl:
        'https://st2.depositphotos.com/4142621/6549/i/600/depositphotos_65494105-stock-photo-luxury-hotel-room.jpg',
      features: ['Cama king size', 'Zona de estar', 'Baño completo', 'Vistas privilegiadas']
    },
    {
      title: 'Habitación Deluxe Terraza',
      description:
        'Propuesta equilibrada para huéspedes que valoran una zona exterior privada y un plus de comodidad en la estancia.',
      capacity: '2-4 personas',
      size: '32 m²',
      priceFrom: 'Desde 170 € / noche',
      imageUrl:
        'https://st2.depositphotos.com/1000441/6460/i/600/depositphotos_64609101-stock-photo-large-terrace-with-loungers.jpg',
      features: ['Terraza privada', 'Espacio luminoso', 'Escritorio', 'Ambiente relajado']
    },
    {
      title: 'Habitación Familiar',
      description:
        'Diseñada para estancias en grupo o en familia, con organización funcional del espacio y mayor capacidad.',
      capacity: '4 personas',
      size: '38 m²',
      priceFrom: 'Desde 195 € / noche',
      imageUrl:
        'https://st3.depositphotos.com/1016811/17863/i/600/depositphotos_178638268-stock-photo-triple-beds-in-a-luxury.jpg',
      features: ['Mayor capacidad', 'Distribución cómoda', 'Baño amplio', 'Ideal para familias']
    },
    {
      title: 'Habitación Cozy',
      description:
        'Opción funcional y acogedora para escapadas cortas o estancias centradas en disfrutar del hotel y la isla.',
      capacity: '2 personas',
      size: '24 m²',
      priceFrom: 'Desde 135 € / noche',
      imageUrl:
        'https://st4.depositphotos.com/12985790/22759/i/600/depositphotos_227591792-stock-photo-black-suitcase-travel-hotel-room.jpg',
      features: ['Diseño práctico', 'Ambiente cálido', 'Todo lo esencial', 'Buena relación calidad-precio']
    }
  ];
}
