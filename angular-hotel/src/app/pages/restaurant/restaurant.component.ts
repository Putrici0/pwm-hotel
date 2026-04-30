import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService } from '../../services/admin-data.service';

interface Dish {
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css'
})
export class RestaurantComponent {
  private readonly adminDataService = inject(AdminDataService);

  menuImage = 'https://st4.depositphotos.com/12982378/30973/i/600/depositphotos_309733034-stock-photo-selective-focus-surprised-man-holding.jpg';

  // Variable para controlar la imagen ampliada
  selectedImageModal: string | null = null;

  private readonly dishes$ = this.adminDataService.watchSection('restaurant').pipe(
    map((rows) =>
      rows.map((row) => ({
        title: String(row['nombre'] || ''),
        description: String(row['descripcion'] || ''),
        imageUrl: String(row['imagen'] || ''),
        category: String(row['categoria'] || '')
      }))
    )
  );

  readonly starters$ = this.dishes$.pipe(map((items) => items.filter((x) => x.category === 'entrantes') as Dish[]));
  readonly firstDishes$ = this.dishes$.pipe(map((items) => items.filter((x) => x.category === 'primeros') as Dish[]));
  readonly secondDishes$ = this.dishes$.pipe(map((items) => items.filter((x) => x.category === 'segundos') as Dish[]));
  readonly desserts$ = this.dishes$.pipe(map((items) => items.filter((x) => x.category === 'postres') as Dish[]));

  constructor() {
    void this.adminDataService.ensureInitialized();
  }

  // Funciones para abrir y cerrar el visor de imágenes
  openImageModal(url: string): void {
    if (url) {
      this.selectedImageModal = url;
    }
  }

  closeImageModal(): void {
    this.selectedImageModal = null;
  }
}
