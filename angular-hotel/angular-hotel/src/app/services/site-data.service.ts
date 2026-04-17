import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SiteDataService {
  private readonly firestore = inject(Firestore);

  getSection<T>(sectionKey: string): Observable<T> {
    const docRef = doc(this.firestore, `pages`, sectionKey);
    return docData(docRef, { idField: 'id' }) as Observable<T>;
  }

  getImageCatalog(): Observable<Record<string, string>> {
    const docRef = doc(this.firestore, 'assets', 'imageCatalog');
    return docData(docRef) as Observable<Record<string, string>>;
  }
  private imageCatalog$ = this.getImageCatalog().pipe(
    shareReplay(1)
  );

  getImage(key: string): Observable<string | null> {
    return this.imageCatalog$.pipe(
      map(catalog => catalog[key] || null)
    );
  }

}
