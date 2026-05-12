import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { Dish } from '../../models/dish.model';
import { FavoritesService } from '../../services/favorites.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    IonContent,
    IonIcon
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  private readonly menuService = inject(MenuService);
  private readonly favoritesService = inject(FavoritesService);

  readonly dishes$ = this.menuService.getMenu$();

  constructor() {
    addIcons({ heart, heartOutline });
  }

  isFavorite(dish: Dish): boolean {
    return this.favoritesService.isFavorite(dish.id);
  }

  toggleFavorite(dish: Dish, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    void this.favoritesService.toggleFavorite(dish.id);
  }
}
