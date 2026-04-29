import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { query, where, getDocs } from '@angular/fire/firestore';

export interface BookingPayload {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  dni: string;
  entrada: string;
  salida: string;
  huespedes: number;
  habitacion: string;
  cliente?: string;
  familySuite?: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private readonly firestore = inject(Firestore);

  async createBooking(payload: BookingPayload): Promise<void> {
    const reservationsRef = collection(this.firestore, 'reservations');
    await addDoc(reservationsRef, payload);
  }
  async getUserBookings(email: string): Promise<BookingPayload[]> {
    const reservationsRef = collection(this.firestore, 'reservations');
    // Es obligatorio filtrar por email para que la regla de seguridad lo permita
    const q = query(reservationsRef, where('email', '==', email));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as BookingPayload);
  }
}
