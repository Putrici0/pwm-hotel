import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { Dish } from '../../models/dish.model';
import { DishesService } from '../../services/dishes.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    IonContent,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon
  ],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css'
})
export class RestaurantComponent {
  private readonly dishesService = inject(DishesService);
  private readonly favoritesService = inject(FavoritesService);

  readonly dishes$ = this.dishesService.watchDishes();

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
