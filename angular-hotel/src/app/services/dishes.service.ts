import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Dish } from '../models/dish.model';
import { AdminDataService } from './admin-data.service';

@Injectable({
  providedIn: 'root'
})
export class DishesService {
  private readonly adminDataService = inject(AdminDataService);

  constructor() {
    void this.adminDataService.ensureInitialized();
  }

  watchDishes(): Observable<Dish[]> {
    return this.adminDataService.watchSection('restaurant').pipe(
      map((rows) =>
        rows
          .map((row) => ({
            id: String(row['id'] || row.id || ''),
            title: String(row['nombre'] || '').trim(),
            description: String(row['descripcion'] || '').trim(),
            imageUrl: String(row['imagen'] || '').trim(),
            category: String(row['categoria'] || '').trim()
          }))
          .filter((dish) => dish.id && dish.title)
      )
    );
  }
}
