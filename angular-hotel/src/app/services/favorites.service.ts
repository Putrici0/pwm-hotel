import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SqliteFavoritesService } from './sqlite-favorites.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly authService = inject(AuthService);
  private readonly sqliteFavoritesService = inject(SqliteFavoritesService);
  private readonly ngZone = inject(NgZone);
  private readonly favoriteIds$ = new BehaviorSubject<Set<string>>(new Set<string>());
  private activeUserEmail = '';

  constructor() {
    this.authService.loggedUserEmail$.subscribe((email) => {
      void this.loadFavoritesForUser(String(email || '').trim().toLowerCase());
    });
  }

  isFavorite(dishId: string): boolean {
    return this.favoriteIds$.value.has(dishId);
  }

  watchFavoriteIds(): Observable<Set<string>> {
    return this.favoriteIds$.asObservable();
  }

  async toggleFavorite(dishId: string): Promise<boolean> {
    const favorites = new Set(this.favoriteIds$.value);
    const shouldBeFavorite = !favorites.has(dishId);

    if (shouldBeFavorite) {
      favorites.add(dishId);
    } else {
      favorites.delete(dishId);
    }

    this.favoriteIds$.next(favorites);

    await this.sqliteFavoritesService.setFavorite(this.activeUserEmail, dishId, shouldBeFavorite);
    return shouldBeFavorite;
  }

  getFavoriteIds(): string[] {
    return [...this.favoriteIds$.value];
  }

  async refreshFavorites(): Promise<void> {
    const email = this.authService.getLoggedUserEmail();
    if (email) {
      await this.loadFavoritesForUser(email.trim().toLowerCase());
    }
  }

  private async loadFavoritesForUser(email: string): Promise<void> {
    this.activeUserEmail = email;
    const favoriteIds = await this.sqliteFavoritesService.getFavoritesByUser(email);
    this.ngZone.run(() => {
      this.favoriteIds$.next(new Set(favoriteIds));
    });
  }
}
