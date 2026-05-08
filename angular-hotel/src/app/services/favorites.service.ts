import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly authService = inject(AuthService);

  isFavorite(dishId: string): boolean {
    return this.getFavoriteSet().has(dishId);
  }

  toggleFavorite(dishId: string): boolean {
    const favorites = this.getFavoriteSet();
    if (favorites.has(dishId)) {
      favorites.delete(dishId);
    } else {
      favorites.add(dishId);
    }
    this.saveFavoriteSet(favorites);
    return favorites.has(dishId);
  }

  getFavoriteIds(): string[] {
    return [...this.getFavoriteSet()];
  }

  private getStorageKey(): string {
    const email = this.authService.getLoggedUserEmail().trim().toLowerCase();
    return `favorite_dishes_${email || 'anonymous'}`;
  }

  private getFavoriteSet(): Set<string> {
    const raw = localStorage.getItem(this.getStorageKey()) || '[]';
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return new Set<string>();
      }
      return new Set(parsed.map((id) => String(id)));
    } catch {
      return new Set<string>();
    }
  }

  private saveFavoriteSet(favorites: Set<string>): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify([...favorites]));
  }
}
