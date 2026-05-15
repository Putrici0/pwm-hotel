import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
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
import { AuthService } from '../../services/auth.service';
import { Dish } from '../../models/dish.model';
import { DishesService } from '../../services/dishes.service';
import { FavoritesService } from '../../services/favorites.service';
import { ViewWillEnter, ViewDidEnter } from '@ionic/angular';

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
export class RestaurantComponent implements OnInit, ViewWillEnter, ViewDidEnter {
  private readonly dishesService = inject(DishesService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly authService = inject(AuthService);

  readonly vm$ = combineLatest([
    this.dishesService.watchDishes(),
    this.favoritesService.watchFavoriteIds()
  ]).pipe(
    map(([dishes, favoriteIds]) => ({
      dishes,
      favoriteIds
    }))
  );

  constructor() {
    addIcons({ heart, heartOutline });
  }

  ngOnInit() {
    this.favoritesService.refreshFavorites();
  }

  ionViewWillEnter() {
    this.favoritesService.refreshFavorites();
  }

  ionViewDidEnter() {
    this.favoritesService.refreshFavorites();
  }

  toggleFavorite(dish: Dish, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    void this.favoritesService.toggleFavorite(dish.id);
  }

  canUseFavorites(): boolean {
    return this.authService.isLoggedIn();
  }
}
