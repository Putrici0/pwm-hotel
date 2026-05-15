import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, heart, heartOutline } from 'ionicons/icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FavoritesService } from '../../services/favorites.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-dish-page',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, IonContent, IonIcon, IonButton],
  templateUrl: './dish-page.component.html',
  styleUrl: './dish-page.component.css'
})
export class DishPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly menuService = inject(MenuService);
  private readonly favoritesService = inject(FavoritesService);

  readonly dish$ = this.menuService.getMenu$().pipe(
    map((dishes) => dishes.find((dish) => dish.id === this.route.snapshot.paramMap.get('id')) || null)
  );

  constructor() {
    addIcons({ arrowBack, heart, heartOutline });
  }

  isFavorite(dishId: string): boolean {
    return this.favoritesService.isFavorite(dishId);
  }

  toggleFavorite(dishId: string): void {
    void this.favoritesService.toggleFavorite(dishId);
  }
}
