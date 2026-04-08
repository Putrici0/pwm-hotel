import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SiteDataService } from './site-data.service';

type AdminDb = Record<string, Array<Record<string, string>>>;

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private readonly siteDataService = inject(SiteDataService);
  private readonly storageKey = 'hotelAdminData';

  async ensureInitialized(): Promise<void> {
    if (localStorage.getItem(this.storageKey)) {
      return;
    }

    const data = await firstValueFrom(this.siteDataService.getAllData());
    const initialData = (data as { initialData?: AdminDb }).initialData || {};
    localStorage.setItem(this.storageKey, JSON.stringify(initialData));
  }

  getDb(): AdminDb {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return parsed && typeof parsed === 'object' ? (parsed as AdminDb) : {};
    } catch {
      return {};
    }
  }

  saveDb(db: AdminDb): void {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  addItem(sectionId: string, item: Record<string, string>): void {
    const db = this.getDb();
    if (!Array.isArray(db[sectionId])) {
      db[sectionId] = [];
    }
    db[sectionId].push(item);
    this.saveDb(db);
  }

  deleteItem(sectionId: string, index: number): void {
    const db = this.getDb();
    if (!Array.isArray(db[sectionId])) {
      return;
    }
    db[sectionId].splice(index, 1);
    this.saveDb(db);
  }
}
