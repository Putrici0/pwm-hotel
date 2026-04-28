import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SiteDataService {
  private readonly firestore = inject(Firestore);

  getSection<T>(sectionKey: string): Observable<T> {
    const docRef = doc(this.firestore, `pages`, sectionKey);
    return (docData(docRef, { idField: 'id' }) as Observable<T | null | undefined>).pipe(
      map((data) => {
        if (this.hasSectionData(data)) {
          return data as T;
        }
        return {} as T;
      }),
      catchError(() => of({} as T))
    );
  }

  private hasSectionData<T>(data: T | null | undefined): boolean {
    if (data == null) {
      return false;
    }

    if (typeof data !== 'object') {
      return true;
    }

    const keys = Object.keys(data as Record<string, unknown>);
    if (keys.length === 0) {
      return false;
    }

    if (keys.length === 1 && keys[0] === 'id') {
      return false;
    }

    return true;
  }

}
