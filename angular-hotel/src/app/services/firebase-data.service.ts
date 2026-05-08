import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminDataService, AdminItem, CrudSectionId } from './admin-data.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDataService {
  private readonly adminDataService = inject(AdminDataService);

  watchCollection(sectionId: CrudSectionId): Observable<AdminItem[]> {
    return this.adminDataService.watchSection(sectionId);
  }
}
