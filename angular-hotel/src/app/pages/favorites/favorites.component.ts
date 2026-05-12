import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { IonBadge, IonContent, IonIcon, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { DishesService } from '../../services/dishes.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
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
    IonNote,
    IonBadge,
    IonIcon
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  private readonly dishesService = inject(DishesService);
  private readonly favoritesService = inject(FavoritesService);

  readonly vm$ = combineLatest([
    this.dishesService.watchDishes(),
    this.favoritesService.watchFavoriteIds()
  ]).pipe(
    map(([dishes, favoriteIds]) => ({
      dishes,
      favoriteIds,
      favorites: dishes.filter((dish) => favoriteIds.has(dish.id))
    }))
  );

  constructor() {
    addIcons({ heart });
  }

}
