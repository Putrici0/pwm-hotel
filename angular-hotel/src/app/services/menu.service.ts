import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Dish } from '../models/dish.model';
import { FirebaseDataService } from './firebase-data.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly firebaseDataService = inject(FirebaseDataService);

  getMenu$(): Observable<Dish[]> {
    return this.firebaseDataService.watchCollection('restaurant').pipe(
      map((rows) =>
        rows
          .map((row) => ({
            id: String(row['id'] || ''),
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
