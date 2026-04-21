import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SiteDataService } from '../../services/site-data.service';

interface RoomSection {
  title: string;
  description: string;
  imageGradient: string;
}

interface RoomsPayload {
  rooms: RoomSection[];
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent {
  private readonly siteDataService = inject(SiteDataService);

  private readonly fallbackRooms: RoomSection[] = [
    {
      title: 'Suite Mar Premium',
      description:
        'La opción más exclusiva. Incluye cocina de diseño, baño turco privado y vistas frontales al océano. Lujo absoluto con cama king size y zona de estar.',
      imageGradient:
        'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(https://st2.depositphotos.com/4142621/6549/i/600/depositphotos_65494105-stock-photo-luxury-hotel-room.jpg) center/cover no-repeat'
    },
    {
      title: 'Habitación Deluxe Terraza',
      description:
        'Espacio luminoso con terraza privada amueblada. Equipada con minibar premium, cafetera de cápsulas y un baño completo con ducha de efecto lluvia.',
      imageGradient:
        'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(https://st2.depositphotos.com/1000441/6460/i/600/depositphotos_64609101-stock-photo-large-terrace-with-loungers.jpg) center/cover no-repeat'
    },
    {
      title: 'Habitación Familiar',
      description:
        'Máxima amplitud para grupos. Cuenta con áreas separadas, mobiliario infantil, nevera familiar y un set de juegos para los más pequeños.',
      imageGradient:
        'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(https://st3.depositphotos.com/1016811/17863/i/600/depositphotos_178638268-stock-photo-triple-beds-in-a-luxury.jpg) center/cover no-repeat'
    },
    {
      title: 'Habitación Cozy',
      description:
        'Práctica y acogedora. Dispone de nevera compacta, Wi-Fi de alta velocidad y un sistema de climatización inteligente para un descanso perfecto.',
      imageGradient:
        'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(https://st4.depositphotos.com/12985790/22759/i/600/depositphotos_227591792-stock-photo-black-suitcase-travel-hotel-room.jpg) center/cover no-repeat'
    }
  ];

  readonly rooms$ = this.siteDataService.getSection<RoomsPayload>('rooms').pipe(
    map((payload) => {
      if (!payload || !Array.isArray(payload.rooms) || payload.rooms.length === 0) {
        return this.fallbackRooms;
      }

      return payload.rooms;
    }),
    catchError(() => of(this.fallbackRooms))
  );
}
