import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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
}
