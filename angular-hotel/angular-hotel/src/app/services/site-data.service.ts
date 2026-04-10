import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SiteDataService {
  private readonly firestore = inject(Firestore);

  getSection<T>(sectionKey: string): Observable<T> {
    const docRef = doc(this.firestore, `siteData`, sectionKey);
    return docData(docRef) as Observable<T>;
  }
}
