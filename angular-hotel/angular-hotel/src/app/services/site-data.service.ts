import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SiteDataService {
  private readonly http = inject(HttpClient);
  private data$?: Observable<Record<string, unknown>>;

  getAllData(): Observable<Record<string, unknown>> {
    if (!this.data$) {
      this.data$ = this.http
        .get<Record<string, unknown>>('/data/site-data.json')
        .pipe(shareReplay(1));
    }
    return this.data$;
  }

  getSection<T>(sectionKey: string): Observable<T> {
    return this.getAllData().pipe(map((data) => data[sectionKey] as T));
  }
}
