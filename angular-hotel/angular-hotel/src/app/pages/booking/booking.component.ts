import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService } from '../../services/admin-data.service';
import { AuthService } from '../../services/auth.service';
import { BookingsService } from '../../services/bookings.service';

interface RoomOption {
  id: string;
  name: string;
  maxGuests: number;
  img: string;
  price: number;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
class BookingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bookingsService = inject(BookingsService);
  private readonly adminDataService = inject(AdminDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  heroImage =
    'https://st2.depositphotos.com/4695029/7141/i/600/depositphotos_71419053-stock-photo-beautiful-swimming-pool.jpg';

  availableRooms: RoomOption[] = [];

  filteredRooms: RoomOption[] = [];
  submitted = false;
  bookingDone = false;
  sending = false;
  searchErrorMessage = '';
  checkoutErrorMessage = '';
  attemptedConfirm = false;

  constructor() {
    void this.adminDataService.ensureInitialized().then(() => {
      this.adminDataService.watchSection('rooms').subscribe((rooms) => {
        this.availableRooms = rooms.map((room) => ({
          id: String(room['id'] || ''),
          name: String(room['nombre'] || ''),
          maxGuests: Number(room['huespedes'] || 0),
          img: String(room['imagen'] || ''),
          price: Number(room['precio'] || 0)
        }));
      });
    });
  }

  readonly searchForm = this.fb.group({
    checkin: ['', Validators.required],
    checkout: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1)]],
    includeFamilySuite: [false]
  });

  readonly checkoutForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    dni: ['', Validators.required],
    habitacion: ['', Validators.required],
    privacy: [false, Validators.requiredTrue]
  });

  searchAvailability(): void {
    const checkin = String(this.searchForm.value.checkin || '');
    const checkout = String(this.searchForm.value.checkout || '');
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime()) || checkinDate >= checkoutDate) {
      this.searchForm.markAllAsTouched();
      this.searchErrorMessage = 'La fecha de entrada debe ser anterior a la fecha de salida.';
      this.checkoutErrorMessage = '';
      this.submitted = false;
      this.filteredRooms = [];
      this.checkoutForm.patchValue({ habitacion: '' });
      return;
    }

    const guests = Number(this.searchForm.value.guests || 0);
    this.filteredRooms = this.availableRooms.filter((room) => room.maxGuests >= guests);
    const selectedRoom = String(this.checkoutForm.value.habitacion || '');
    const selectedStillAvailable = this.filteredRooms.some((room) => room.name === selectedRoom);
    if (!selectedStillAvailable) {
      this.checkoutForm.patchValue({ habitacion: '' });
    }
    this.submitted = true;
    this.bookingDone = false;
    this.searchErrorMessage = '';
    this.checkoutErrorMessage = '';
  }

  async confirmBooking(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.checkoutErrorMessage = 'Debes iniciar sesion para poder reservar.';
      this.searchErrorMessage = '';
      void this.router.navigateByUrl('/login');
      return;
    }

    this.attemptedConfirm = true;
    if (this.checkoutForm.invalid || this.searchForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.searchForm.markAllAsTouched();
      this.checkoutErrorMessage = 'Revisa los datos del formulario.';
      this.searchErrorMessage = '';
      return;
    }

    const checkin = String(this.searchForm.value.checkin || '');
    const checkout = String(this.searchForm.value.checkout || '');
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime()) || checkinDate >= checkoutDate) {
      this.checkoutErrorMessage = 'La fecha de entrada debe ser anterior a la fecha de salida.';
      this.searchErrorMessage = '';
      return;
    }

    const selectedRoom = this.availableRooms.find((room) => room.name === (this.checkoutForm.value.habitacion || ''));
    const guests = Number(this.searchForm.value.guests || 0);
    if (!selectedRoom) {
      this.checkoutErrorMessage = 'Selecciona una habitacion valida.';
      this.searchErrorMessage = '';
      return;
    }
    if (guests > selectedRoom.maxGuests) {
      this.checkoutErrorMessage = `La habitacion seleccionada permite como maximo ${selectedRoom.maxGuests} huespedes.`;
      this.searchErrorMessage = '';
      return;
    }

    this.sending = true;
    this.bookingDone = false;
    this.checkoutErrorMessage = '';
    this.searchErrorMessage = '';

    try {
      await this.withTimeout(
        this.bookingsService.createBooking({
          nombre: this.checkoutForm.value.nombre || '',
          apellidos: this.checkoutForm.value.apellidos || '',
          email: this.checkoutForm.value.email || '',
          telefono: this.checkoutForm.value.telefono || '',
          dni: this.checkoutForm.value.dni || '',
          entrada: this.searchForm.value.checkin || '',
          salida: this.searchForm.value.checkout || '',
          huespedes: Number(this.searchForm.value.guests || 0),
          habitacion: this.checkoutForm.value.habitacion || '',
          cliente: `${this.checkoutForm.value.nombre || ''} ${this.checkoutForm.value.apellidos || ''}`.trim(),
          familySuite: !!this.searchForm.value.includeFamilySuite,
          createdAt: new Date().toISOString()
        }),
        10000,
        'timeout'
      );

      this.bookingDone = true;
    } catch (error) {
      console.error(error);
      const code = String((error as { code?: string; message?: string })?.code || '');
      const message = String((error as { message?: string })?.message || '');
      if (code.includes('permission-denied') || message.toLowerCase().includes('permission')) {
        this.checkoutErrorMessage = 'No tienes permisos para crear reservas. Inicia sesion con una cuenta valida.';
      } else if (message === 'timeout') {
        this.checkoutErrorMessage = 'La operacion tardo demasiado. Intenta de nuevo.';
      } else {
        this.checkoutErrorMessage = 'No se pudo guardar la reserva.';
      }
    } finally {
      this.sending = false;
    }
  }

  get summaryCheckin(): string {
    return this.formatSummaryDate(this.searchForm.value.checkin || '');
  }

  get summaryCheckout(): string {
    return this.formatSummaryDate(this.searchForm.value.checkout || '');
  }

  get selectedRoomName(): string {
    return String(this.checkoutForm.value.habitacion || '');
  }

  isCheckoutInvalid(controlName: 'nombre' | 'apellidos' | 'telefono' | 'dni' | 'email' | 'habitacion' | 'privacy'): boolean {
    const control = this.checkoutForm.get(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && (control.touched || this.attemptedConfirm);
  }

  private formatSummaryDate(rawDate: string): string {
    if (!rawDate) {
      return '--/--/----';
    }

    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return rawDate;
    }

    return new Intl.DateTimeFormat('es-ES').format(parsedDate);
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}

export default BookingComponent
