import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { IonButton, IonContent, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, heart, heartOutline } from 'ionicons/icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { DishesService } from '../../services/dishes.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-dish-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, IonContent, IonToolbar, IonTitle, IonButton, IonIcon],
  templateUrl: './dish-detail.component.html',
  styleUrl: './dish-detail.component.css'
})
export class DishDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly dishesService = inject(DishesService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly authService = inject(AuthService);

  readonly vm$ = combineLatest([
    this.dishesService.watchDishes(),
    this.favoritesService.watchFavoriteIds()
  ]).pipe(
    map(([dishes, favoriteIds]) => {
      const dish = dishes.find((item) => item.id === this.route.snapshot.paramMap.get('id')) || null;
      return { dish, isFavorite: !!dish && favoriteIds.has(dish.id) };
    })
  );

  constructor() {
    addIcons({ arrowBack, heart, heartOutline });
  }

  toggleFavorite(dishId: string): void {
    void this.favoritesService.toggleFavorite(dishId);
  }

  canUseFavorites(): boolean {
    return this.authService.isLoggedIn();
  }
}
