import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
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
  styleUrl: './booking.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BookingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bookingsService = inject(BookingsService);
  private readonly adminDataService = inject(AdminDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly firestore = inject(Firestore);
  private sendingWatchdog: ReturnType<typeof setTimeout> | null = null;

  heroImage =
    'https://st2.depositphotos.com/4695029/7141/i/600/depositphotos_71419053-stock-photo-beautiful-swimming-pool.jpg';

  availableRooms: RoomOption[] = [];
  filteredRooms: RoomOption[] = [];
  selectedRoomsArr: RoomOption[] = [];
  currentCapacity = 0;
  totalNights = 0;
  requestedGuests = 0;
  statusBarMessage = 'Por favor, selecciona habitaciones para tus huéspedes.';
  statusBarBackground = '#D4C4A8';
  showCheckoutSection = false;

  submitted = false;
  bookingDone = false;
  sending = false;
  searchErrorMessage = '';
  checkoutErrorMessage = '';
  attemptedConfirm = false;

  constructor() {
    void this.prefillLoggedUserData();

    void this.adminDataService.ensureInitialized().then(() => {
      this.adminDataService.watchSection('rooms').subscribe((rooms) => {
        this.availableRooms = rooms.map((room) => ({
          id: String(room['id'] || ''),
          name: String(room['nombre'] || ''),
          maxGuests: Number(room['huespedes'] || 0),
          img: String(room['imagen'] || ''),
          price: Number(room['precio'] || 0)
        }));
        this.cdr.detectChanges();
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
    privacy: [false, Validators.requiredTrue]
  });

  searchAvailability(): void {
    this.selectedRoomsArr = [];
    this.currentCapacity = 0;
    this.showCheckoutSection = false;
    this.statusBarBackground = '#D4C4A8';
    this.statusBarMessage = 'Por favor, selecciona habitaciones para tus huéspedes.';

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
      this.cdr.detectChanges();
      return;
    }

    const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
    this.totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.requestedGuests = Number(this.searchForm.value.guests || 0);

    let availableRoomsFiltered = this.availableRooms;
    if (this.searchForm.value.includeFamilySuite === false) {
      availableRoomsFiltered = availableRoomsFiltered.filter(r => r.id !== 'familiar');
    }

    this.filteredRooms = availableRoomsFiltered;

    this.submitted = true;
    this.bookingDone = false;
    this.searchErrorMessage = '';
    this.checkoutErrorMessage = '';
    this.updateStatusBar();
    this.cdr.detectChanges();
  }

  selectRoom(room: RoomOption): void {
    const roomIndex = this.selectedRoomsArr.findIndex(selected => selected.id === room.id);

    if (roomIndex > -1) {
      // Room is already selected, so deselect it
      this.currentCapacity -= this.selectedRoomsArr[roomIndex].maxGuests;
      this.selectedRoomsArr.splice(roomIndex, 1);
    } else {
      // Room is not selected, so select it
      this.selectedRoomsArr.push(room);
      this.currentCapacity += room.maxGuests;
    }

    this.updateStatusBar();
    this.cdr.detectChanges();
  }

  isRoomSelected(room: RoomOption): boolean {
    return this.selectedRoomsArr.some(selected => selected.id === room.id);
  }

  getRoomButtonText(room: RoomOption): string {
    if (this.isRoomSelected(room)) {
      return 'Cambiar';
    }
    if (this.currentCapacity >= this.requestedGuests) {
      return 'Cupo lleno';
    }
    return 'Seleccionar';
  }

  updateStatusBar(): void {
    if (this.currentCapacity < this.requestedGuests) {
      this.statusBarMessage = `Llevas ${this.currentCapacity} plazas. Faltan ${this.requestedGuests - this.currentCapacity} más. Añade otra habitación.`;
      this.statusBarBackground = '#e67e22';
      this.showCheckoutSection = false;
    } else {
      this.statusBarMessage = `¡Perfecto! Completa tus datos abajo.`;
      this.statusBarBackground = '#27ae60';
      this.showCheckoutSection = true;
    }
  }

  async confirmBooking(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.checkoutErrorMessage = 'Debes iniciar sesion para poder reservar.';
      this.searchErrorMessage = '';
      void this.router.navigateByUrl('/login');
      return;
    }

    this.attemptedConfirm = true;
    if (this.checkoutForm.invalid || this.searchForm.invalid || this.selectedRoomsArr.length === 0 || this.currentCapacity < this.requestedGuests) {
      this.checkoutForm.markAllAsTouched();
      this.searchForm.markAllAsTouched();
      if (this.selectedRoomsArr.length === 0 || this.currentCapacity < this.requestedGuests) {
        this.checkoutErrorMessage = 'Por favor, selecciona suficientes habitaciones para todos los huéspedes.';
      } else {
        this.checkoutErrorMessage = 'Revisa los datos del formulario.';
      }
      this.searchErrorMessage = '';
      this.cdr.detectChanges();
      return;
    }

    const checkin = String(this.searchForm.value.checkin || '');
    const checkout = String(this.searchForm.value.checkout || '');
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime()) || checkinDate >= checkoutDate) {
      this.checkoutErrorMessage = 'La fecha de entrada debe ser anterior a la fecha de salida.';
      this.searchErrorMessage = '';
      this.cdr.detectChanges();
      return;
    }

    this.setSending(true);
    this.bookingDone = false;
    this.checkoutErrorMessage = '';
    this.searchErrorMessage = '';

    try {
      const bookingPromises = this.selectedRoomsArr.map(room => {
        return this.bookingsService.createBooking({
          nombre: this.checkoutForm.value.nombre || '',
          apellidos: this.checkoutForm.value.apellidos || '',
          email: this.checkoutForm.value.email || '',
          telefono: this.checkoutForm.value.telefono || '',
          dni: this.checkoutForm.value.dni || '',
          entrada: this.searchForm.value.checkin || '',
          salida: this.searchForm.value.checkout || '',
          huespedes: this.requestedGuests, // Total guests for the booking
          habitacion: room.name, // Each room is booked individually
          cliente: `${this.checkoutForm.value.nombre || ''} ${this.checkoutForm.value.apellidos || ''}`.trim(),
          familySuite: !!this.searchForm.value.includeFamilySuite,
          createdAt: new Date().toISOString()
        });
      });

      await this.withTimeout(
        Promise.all(bookingPromises),
        10000,
        'timeout'
      );

      this.bookingDone = true;
      this.resetFormsAfterSuccess();
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
      this.setSending(false);
      this.cdr.detectChanges();
    }
  }

  get summaryCheckin(): string {
    return this.formatSummaryDate(this.searchForm.value.checkin || '');
  }

  get summaryCheckout(): string {
    return this.formatSummaryDate(this.searchForm.value.checkout || '');
  }

  get selectedRoomNames(): string {
    return this.selectedRoomsArr.map(room => room.name).join(', ') || 'Sin seleccionar';
  }

  get totalBookingPrice(): number {
    return this.selectedRoomsArr.reduce((total, room) => total + (room.price * this.totalNights), 0);
  }

  isCheckoutInvalid(controlName: 'nombre' | 'apellidos' | 'telefono' | 'dni' | 'email' | 'privacy'): boolean {
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

  private setSending(value: boolean): void {
    if (this.sendingWatchdog) {
      clearTimeout(this.sendingWatchdog);
      this.sendingWatchdog = null;
    }

    this.ngZone.run(() => {
      this.sending = value;
    });

    if (value) {
      this.sendingWatchdog = setTimeout(() => {
        this.ngZone.run(() => {
          this.sending = false;
        });
        this.requestViewRefresh();
      }, 15000);
    }

    this.requestViewRefresh();
  }

  closeSuccessModal(): void {
    this.bookingDone = false;
    this.requestViewRefresh();
  }

  private resetFormsAfterSuccess(): void {
    this.checkoutForm.reset({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      dni: '',
      privacy: false
    });
    this.searchForm.reset({
      checkin: '',
      checkout: '',
      guests: 2,
      includeFamilySuite: false
    });
    this.filteredRooms = [];
    this.selectedRoomsArr = [];
    this.currentCapacity = 0;
    this.totalNights = 0;
    this.requestedGuests = 0;
    this.statusBarMessage = 'Por favor, selecciona habitaciones para tus huéspedes.';
    this.statusBarBackground = '#D4C4A8';
    this.showCheckoutSection = false;
    this.submitted = false;
    this.attemptedConfirm = false;
    this.cdr.detectChanges();
  }

  private requestViewRefresh(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // no-op
    }
  }

  private async prefillLoggedUserData(): Promise<void> {
    const patch: Partial<{
      nombre: string;
      apellidos: string;
      email: string;
      dni: string;
    }> = {
      nombre: localStorage.getItem('loggedUserNombre') || '',
      apellidos: localStorage.getItem('loggedUserApellidos') || '',
      email: this.authService.getLoggedUserEmail() || localStorage.getItem('loggedUserEmail') || '',
      dni: ''
    };

    const uid = this.authService.getLoggedUserUid() || localStorage.getItem('loggedUserUid') || '';
    if (uid) {
      try {
        const userSnapshot = await getDoc(doc(this.firestore, 'users', uid));
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as Record<string, unknown>;
          patch.nombre = String(userData['nombre'] || patch.nombre || '');
          patch.apellidos = String(userData['apellidos'] || patch.apellidos || '');
          patch.email = String(userData['email'] || patch.email || '');
          patch.dni = String(userData['dni'] || '');
        }
      } catch {
        // no-op
      }
    }

    this.checkoutForm.patchValue({
      nombre: patch.nombre || '',
      apellidos: patch.apellidos || '',
      email: patch.email || '',
      dni: patch.dni || ''
    });
    this.requestViewRefresh();
  }
}

export default BookingComponent
