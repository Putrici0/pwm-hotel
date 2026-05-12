import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
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
  cantidad: number;
  _availableStock: number;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent, IonContent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bookingsService = inject(BookingsService);
  private readonly adminDataService = inject(AdminDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly firestore = inject(Firestore);
  private sendingWatchdog: ReturnType<typeof setTimeout> | null = null;

  heroImage = 'https://masdunas.es/wp-content/uploads/2018/10/dunas-moviles-edit-1024x286.png';

  availableRooms: RoomOption[] = [];
  filteredRooms: RoomOption[] = [];
  selectedRoomsArr: RoomOption[] = [];
  allReservations: any[] = [];

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
        this.availableRooms = rooms.map((room) => {
          // LÓGICA ESTRICTA DE STOCK PARA EVITAR QUE EL 0 SE CONVIERTA EN 1
          const rawStock = room['cantidad'];
          const stockVal = (rawStock !== undefined && rawStock !== null && rawStock !== '') ? Number(rawStock) : 1;

          return {
            id: String(room['id'] || ''),
            name: String(room['nombre'] || ''),
            maxGuests: Number(room['huespedes'] || 0),
            img: String(room['imagen'] || ''),
            price: Number(room['precio'] || 0),
            cantidad: stockVal,
            _availableStock: 0
          };
        });
        this.cdr.detectChanges();
      });

      this.adminDataService.watchSection('reservations').subscribe((reservations) => {
        this.allReservations = reservations;
      });
    });
  }

  readonly searchForm = this.fb.group({
    checkin: ['', Validators.required],
    checkout: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1), Validators.max(6)]],
    includeFamilySuite: [false]
  });

  readonly checkoutForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    telefono: [''],
    dni: [''],
    privacy: [false, Validators.requiredTrue]
  });

  searchAvailability(): void {
    this.selectedRoomsArr = [];
    this.currentCapacity = 0;
    this.showCheckoutSection = false;
    this.statusBarBackground = '#D4C4A8';
    this.statusBarMessage = 'Por favor, selecciona habitaciones para tus huéspedes.';
    this.searchErrorMessage = '';

    const checkin = String(this.searchForm.value.checkin || '');
    const checkout = String(this.searchForm.value.checkout || '');
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime()) || checkinDate >= checkoutDate) {
      this.searchForm.markAllAsTouched();
      this.searchErrorMessage = 'La fecha de entrada debe ser anterior a la fecha de salida.';
      this.submitted = false;
      this.cdr.detectChanges();
      return;
    }

    const inTime = checkinDate.getTime();
    const outTime = checkoutDate.getTime();
    this.totalNights = Math.ceil(Math.abs(outTime - inTime) / (1000 * 60 * 60 * 24));
    this.requestedGuests = Number(this.searchForm.value.guests || 0);

    // 1. FILTRAR POR STOCK REAL
    let roomsWithStock = this.availableRooms.map(room => {
      let overlappingCount = 0;
      this.allReservations.forEach(res => {
        if (String(res['habitacion']).includes(room.name)) {
          const resIn = new Date(String(res['entrada'])).getTime();
          const resOut = new Date(String(res['salida'])).getTime();
          if (inTime < resOut && outTime > resIn) {
            const regex = new RegExp(room.name, 'g');
            const matches = String(res['habitacion']).match(regex);
            if (matches) overlappingCount += matches.length;
          }
        }
      });
      return { ...room, _availableStock: room.cantidad - overlappingCount };
    }).filter(r => r._availableStock > 0);

    // 2. APLICAR LÓGICA DE FAMILIA
    if (this.searchForm.value.includeFamilySuite) {
      if (this.requestedGuests <= 3) {
        roomsWithStock = roomsWithStock.filter(r => r.maxGuests >= 3 && r.maxGuests <= 6);
      } else if (this.requestedGuests === 4) {
        roomsWithStock = roomsWithStock.filter(r => r.maxGuests >= 4 && r.maxGuests <= 6);
      } else if (this.requestedGuests >= 5) {
        roomsWithStock = roomsWithStock.filter(r => r.maxGuests >= 6);
      }
    } else {
      roomsWithStock = roomsWithStock.filter(r => r.maxGuests >= 1);
    }

    if (roomsWithStock.length === 0) {
      this.searchErrorMessage = 'Lo siento, pero no hay más habitaciones disponibles para estas fechas.';
      this.submitted = false;
      this.cdr.detectChanges();
      return;
    }

    this.filteredRooms = roomsWithStock;
    this.submitted = true;
    this.bookingDone = false;
    this.updateStatusBar();
    this.cdr.detectChanges();
  }

  getSelectedCount(room: RoomOption): number {
    return this.selectedRoomsArr.filter(r => r.id === room.id).length;
  }

  addRoom(room: RoomOption): void {
    if (this.currentCapacity >= this.requestedGuests) return;
    if (this.getSelectedCount(room) >= room._availableStock) return;

    this.selectedRoomsArr.push(room);
    this.currentCapacity += room.maxGuests;
    this.updateStatusBar();
    this.cdr.detectChanges();
  }

  removeRoom(room: RoomOption): void {
    const idx = this.selectedRoomsArr.findIndex(r => r.id === room.id);
    if (idx > -1) {
      this.currentCapacity -= this.selectedRoomsArr[idx].maxGuests;
      this.selectedRoomsArr.splice(idx, 1);
      this.updateStatusBar();
      this.cdr.detectChanges();
    }
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
      this.checkoutErrorMessage = 'Debes iniciar sesión para poder reservar.';
      void this.router.navigateByUrl('/login');
      return;
    }

    this.attemptedConfirm = true;
    if (this.checkoutForm.invalid || this.selectedRoomsArr.length === 0 || this.currentCapacity < this.requestedGuests) {
      this.checkoutForm.markAllAsTouched();
      this.checkoutErrorMessage = 'Revisa los datos del formulario y asegúrate de haber seleccionado suficientes plazas.';
      this.cdr.detectChanges();
      return;
    }

    this.setSending(true);
    try {
      const roomNames = this.selectedRoomsArr.map(r => r.name).join(', ');
      await this.bookingsService.createBooking({
        nombre: this.checkoutForm.value.nombre || '',
        apellidos: this.checkoutForm.value.apellidos || '',
        email: this.checkoutForm.value.email || '',
        telefono: this.checkoutForm.value.telefono || 'No especificado',
        dni: this.checkoutForm.value.dni || 'No especificado',
        entrada: this.searchForm.value.checkin || '',
        salida: this.searchForm.value.checkout || '',
        huespedes: this.requestedGuests,
        habitacion: roomNames,
        cliente: `${this.checkoutForm.value.nombre || ''} ${this.checkoutForm.value.apellidos || ''}`.trim(),
        familySuite: !!this.searchForm.value.includeFamilySuite,
        createdAt: new Date().toISOString()
      });
      this.bookingDone = true;
      this.resetFormsAfterSuccess();
    } catch (error) {
      this.checkoutErrorMessage = 'No se pudo guardar la reserva.';
    } finally {
      this.setSending(false);
      this.cdr.detectChanges();
    }
  }

  get summaryCheckin(): string { return this.formatSummaryDate(this.searchForm.value.checkin || ''); }
  get summaryCheckout(): string { return this.formatSummaryDate(this.searchForm.value.checkout || ''); }
  get selectedRoomNames(): string { return this.selectedRoomsArr.map(room => room.name).join(', ') || 'Sin seleccionar'; }
  get totalBookingPrice(): number { return this.selectedRoomsArr.reduce((total, room) => total + (room.price * this.totalNights), 0); }

  isCheckoutInvalid(controlName: 'nombre' | 'apellidos' | 'telefono' | 'dni' | 'email' | 'privacy'): boolean {
    const control = this.checkoutForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.attemptedConfirm);
  }

  private formatSummaryDate(rawDate: string): string {
    if (!rawDate) return '--/--/----';
    const parsedDate = new Date(rawDate);
    return Number.isNaN(parsedDate.getTime()) ? rawDate : new Intl.DateTimeFormat('es-ES').format(parsedDate);
  }

  private setSending(value: boolean): void {
    this.ngZone.run(() => { this.sending = value; });
    this.cdr.detectChanges();
  }

  closeSuccessModal(): void {
    this.bookingDone = false;
    this.cdr.detectChanges();
  }

  private resetFormsAfterSuccess(): void {
    this.checkoutForm.reset();
    this.searchForm.reset({ guests: 2, includeFamilySuite: false });
    this.submitted = false;
    this.showCheckoutSection = false;
    this.selectedRoomsArr = [];
    this.currentCapacity = 0;
    this.cdr.detectChanges();
  }

  private async prefillLoggedUserData(): Promise<void> {
    const uid = this.authService.getLoggedUserUid();
    if (uid) {
      try {
        const userSnap = await getDoc(doc(this.firestore, 'users', uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          this.checkoutForm.patchValue({
            nombre: data['nombre'] || '',
            apellidos: data['apellidos'] || '',
            email: data['email'] || ''
          });
          this.cdr.detectChanges();
        }
      } catch {}
    }
  }
}

export default BookingComponent;
