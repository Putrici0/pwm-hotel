import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { IonContent, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { DishesService } from '../../services/dishes.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, IonContent, IonToolbar, IonTitle, IonList, IonItem, IonLabel],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  private readonly dishesService = inject(DishesService);
  private readonly favoritesService = inject(FavoritesService);

  readonly favorites$ = this.dishesService.watchDishes().pipe(
    map((dishes) => {
      const favoriteIds = new Set(this.favoritesService.getFavoriteIds());
      return dishes.filter((dish) => favoriteIds.has(dish.id));
    })
  );
}
