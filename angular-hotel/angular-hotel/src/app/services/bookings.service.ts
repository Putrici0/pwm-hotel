import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

export interface BookingPayload {
  name: string;
  lastName: string;
  email: string;
  checkin: string;
  checkout: string;
  guests: number;
  roomName: string;
  familySuite: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private readonly firestore = inject(Firestore);

  async createBooking(payload: BookingPayload): Promise<void> {
    const bookingsRef = collection(this.firestore, 'bookings');
    await addDoc(bookingsRef, payload);
  }
}
