import { Injectable, NgZone, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

type AdminValue = string | number | null | undefined;
export type AdminItem = Record<string, AdminValue> & { id?: string };
type AdminDb = Record<string, AdminItem[]>;

export type CrudSectionId = 'rooms' | 'restaurant' | 'reservations' | 'activities' | 'wellness';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly sectionIds: CrudSectionId[] = ['rooms', 'restaurant', 'reservations', 'activities', 'wellness'];
  private readonly db: AdminDb = {
    rooms: [],
    restaurant: [],
    reservations: [],
    activities: [],
    wellness: []
  };
  private syncStarted = false;

  async ensureInitialized(): Promise<void> {
    this.ensureRealtimeSync();
  }

  getDb(): AdminDb {
    return JSON.parse(JSON.stringify(this.db));
  }

  watchSection(sectionId: CrudSectionId): Observable<AdminItem[]> {
    return new Observable<AdminItem[]>((subscriber) => {
      const sectionRef = collection(this.firestore, sectionId);
      const unsubscribe = onSnapshot(
        sectionRef,
        (snapshot) => {
          const rows: AdminItem[] = snapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...(docItem.data() as Record<string, string | number | null>)
          }));
          this.ngZone.run(() => subscriber.next(rows));
        },
        (error) => this.ngZone.run(() => subscriber.error(error))
      );

      return () => unsubscribe();
    });
  }

  async addItem(sectionId: CrudSectionId, item: AdminItem): Promise<void> {
    const sectionRef = collection(this.firestore, sectionId);
    await addDoc(sectionRef, this.sanitizeItem(item));
  }

  async updateItem(sectionId: CrudSectionId, itemId: string, item: AdminItem): Promise<void> {
    const itemRef = doc(this.firestore, sectionId, itemId);
    await updateDoc(itemRef, this.sanitizeItem(item));
  }

  async deleteItemById(sectionId: CrudSectionId, itemId: string): Promise<void> {
    const itemRef = doc(this.firestore, sectionId, itemId);
    await deleteDoc(itemRef);
  }

  getUserReservations(email: string): Observable<AdminItem[]> {
    return this.watchSection('reservations').pipe(
      map((items) => items.filter((item) => String(item['email'] || '') === email))
    );
  }

  private ensureRealtimeSync(): void {
    if (this.syncStarted) {
      return;
    }

    this.syncStarted = true;
    this.sectionIds.forEach((sectionId) => {
      this.watchSection(sectionId).subscribe((items) => {
        this.db[sectionId] = items;
      });
    });
  }

  private sanitizeItem(item: AdminItem): Record<string, string | number | null> {
    const output: Record<string, string | number | null> = {};
    Object.entries(item).forEach(([key, value]) => {
      if (key === 'id') {
        return;
      }
      if (typeof value === 'number' && Number.isFinite(value)) {
        output[key] = value;
        return;
      }
      if (value === null) {
        output[key] = null;
        return;
      }
      output[key] = String(value ?? '');
    });
    return output;
  }
}
