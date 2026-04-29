import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { Firestore, doc, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService } from '../../services/admin-data.service';
import { AuthService } from '../../services/auth.service';

interface AccountUser {
  nombre: string;
  apellidos: string;
  email: string;
  dni?: string;
  nacimiento?: string;
}

interface UserProfileDocument {
  email?: string;
  isAdmin?: boolean;
  nombre?: string;
  apellidos?: string;
  dni?: string;
  nacimiento?: string;
}

interface ReservationItem {
  cliente?: string;
  email?: string;
  habitacion?: string;
  id?: string;
  entrada?: string;
  salida?: string;
  huespedes?: number | string;
}

type AdminItem = Record<string, string | number | null | undefined>;
type AdminDb = Record<string, AdminItem[]>;

type AccountTabId = 'datos' | 'reservas' | 'descuentos' | 'admin';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly adminDataService = inject(AdminDataService);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  private userUid = '';
  private savingDataWatchdog: ReturnType<typeof setTimeout> | null = null;
  private lastLocalProfileUpdateAt = 0;

  accountConfig: any = null;
  private readonly defaultAccountConfig = {
    title: {
      title: 'Tu cuenta',
      description: 'Aqui puedes ver tus reservas, consultar tus descuentos y actualizar tus datos personales.'
    },
    actions: {
      buttons: ['Cambiar tus datos', 'Guardar Cambios', 'Cambiar contrasena']
    },
    users: []
  };
  currentTab: AccountTabId = 'datos';

  user: AccountUser = {
    nombre: '',
    apellidos: '',
    email: '',
    dni: '',
    nacimiento: ''
  };
  isLoadingUser = true;
  userLoadError = '';
  adminDb: AdminDb = {};
  userReservations: ReservationItem[] = [];
  allReservations: ReservationItem[] = [];

  isEditingData = false;
  showPasswordSection = false;
  isSavingData = false;
  statusType: 'success' | 'danger' | '' = '';
  statusMessage = '';
  pendingReservationToCancel: ReservationItem | null = null;
  modalMessage = '';

  editableData = {
    nombre: '',
    apellidos: '',
    dni: '',
    nacimiento: ''
  };

  passwordForm = {
    current: '',
    next: '',
    confirm: ''
  };

  private readonly baseTabs: Array<{ id: Exclude<AccountTabId, 'admin'>; label: string }> = [
    { id: 'datos', label: 'Consultar tus datos' },
    { id: 'reservas', label: 'Consultar tus reservas' },
    { id: 'descuentos', label: 'Consultar los descuentos reservados a ti' }
  ];

  get tabs(): Array<{ id: AccountTabId; label: string }> {
    if (!this.authService.isAdmin()) {
      return this.baseTabs;
    }

    return [...this.baseTabs, { id: 'admin', label: 'Admin' }];
  }

  readonly discounts = [
    { code: 'RESTAURANTE20', description: '20% de descuento en el Menu Fijo.' },
    { code: 'ACTIVIDAD15', description: '15% de descuento en actividades.' },
    { code: 'SPARELAX', description: '1 hora de Spa gratis.' }
  ];

  async ngOnInit(): Promise<void> {
    this.accountConfig = this.defaultAccountConfig;
    await this.initializeUserAndData(); // Esto asegura que this.user.email esté disponible

    // Ahora que this.user.email está disponible, podemos suscribirnos a las reservas
    void this.adminDataService.ensureInitialized().then(() => {
      this.adminDb = this.adminDataService.getDb();
      this.adminDataService.watchSection('rooms').subscribe((rooms) => {
        this.adminDb = {
          ...this.adminDb,
          rooms
        };
      });
      this.adminDataService.watchSection('reservations').subscribe((reservations) => {
        this.allReservations = reservations as ReservationItem[];
        this.syncVisibleReservations(); // Solo se llama aquí, garantizando allReservations está actualizado
      });
    });
  }

  setTab(tabId: AccountTabId): void {
    if (tabId === 'admin') {
      void this.router.navigateByUrl('/admin');
      return;
    }

    this.currentTab = tabId;
    this.isEditingData = false;
    this.showPasswordSection = false;
    this.resetPasswordForm();
    // No llamar syncVisibleReservations aquí, ya se maneja por la suscripción
  }

  private async initializeUserAndData(): Promise<void> {
    this.isLoadingUser = true;
    this.userLoadError = '';
    await this.authService.waitForSessionReady();

    this.userUid = this.authService.getLoggedUserUid();
    let loggedEmail = this.authService.getLoggedUserEmail() || localStorage.getItem('loggedUserEmail') || '';

    // Inicializar user con los datos locales disponibles
    this.user = {
      nombre: localStorage.getItem('loggedUserNombre') || '',
      apellidos: localStorage.getItem('loggedUserApellidos') || '',
      email: loggedEmail, // Usar el email más actual
      dni: '',
      nacimiento: this.normalizeBirthDate(localStorage.getItem('loggedUserNacimiento') || '')
    };

    if (!this.userUid) {
      // No hay usuario logueado, solo usar datos de localStorage
      this.syncEditableData();
      this.isLoadingUser = false;
      return;
    }

    try {
      const userRef = doc(this.firestore, 'users', this.userUid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as UserProfileDocument;
        this.user = {
          nombre: String(userData.nombre || this.user.nombre), // Preferir datos de Firestore, fallback a local
          apellidos: String(userData.apellidos || this.user.apellidos),
          email: String(userData.email || loggedEmail), // Asegurar que el email se actualiza desde Firestore si está disponible
          dni: String(userData.dni || ''),
          nacimiento: this.normalizeBirthDate(String(userData.nacimiento || ''))
        };
      } else {
        // El documento del usuario no existe, crearlo con los datos locales actuales
        await setDoc(
          userRef,
          {
            email: loggedEmail,
            isAdmin: false,
            nombre: this.user.nombre,
            apellidos: this.user.apellidos,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        // this.user ya está configurado desde localStorage, no es necesario reasignar baseUser
      }
    } catch (error) {
      console.error('Error initializing user data from Firestore:', error);
      // Si Firestore falla, asegurar que el objeto user tenga al menos el email
      if (!this.user.email) {
        this.user.email = loggedEmail;
      }
    }

    this.syncEditableData();
    this.isLoadingUser = false;
  }

  private syncEditableData(): void {
    this.editableData = {
      nombre: this.user?.nombre || '',
      apellidos: this.user?.apellidos || '',
      dni: this.user?.dni || '',
      nacimiento: this.normalizeBirthDate(this.user?.nacimiento || '')
    };
  }

  enableDataEdit(): void {
    this.isEditingData = true;
  }

  async saveData(): Promise<void> {
    this.clearStatus();

    if (this.isSavingData) {
      return;
    }

    if (!this.userUid) {
      await this.authService.waitForSessionReady(3000);
      this.userUid = this.authService.getLoggedUserUid();
    }

    if (!this.userUid) {
      this.setSavingData(false);
      this.setStatus('danger', 'No se pudo guardar: sesion no disponible.');
      return;
    }

    this.setSavingData(true);
    this.lastLocalProfileUpdateAt = Date.now();
    this.user = {
      ...this.user,
      nombre: this.editableData.nombre,
      apellidos: this.editableData.apellidos,
      dni: this.editableData.dni,
      nacimiento: this.editableData.nacimiento
    };

    try {
      await this.withTimeout(
        setDoc(
          doc(this.firestore, 'users', this.userUid),
          {
            email: this.user.email,
            nombre: this.user.nombre,
            apellidos: this.user.apellidos,
            dni: this.user.dni || '',
            nacimiento: this.user.nacimiento || '',
            updatedAt: serverTimestamp()
          },
          { merge: true }
        ),
        10000,
        'timeout'
      );
      this.setStatus('success', 'Datos guardados.');
      this.setEditingData(false);
      localStorage.setItem('loggedUserNombre', this.user.nombre || '');
      localStorage.setItem('loggedUserApellidos', this.user.apellidos || '');
      localStorage.setItem('loggedUserNacimiento', this.user.nacimiento || '');
    } catch (error) {
      const message = String((error as { message?: string })?.message || '');
      if (message === 'timeout') {
        this.setStatus('danger', 'Guardado agotado por tiempo. Revisa conexion e intentalo de nuevo.');
      } else {
        this.setStatus('danger', 'No se pudieron guardar los datos en Firestore.');
      }
    } finally {
      this.setSavingData(false);
    }
  }

  openPasswordSection(): void {
    this.showPasswordSection = true;
    this.isEditingData = false;
    this.resetPasswordForm();
  }

  cancelPasswordChange(): void {
    this.showPasswordSection = false;
    this.resetPasswordForm();
  }

  async updatePassword(): Promise<void> {
    this.clearStatus();

    if (this.passwordForm.next !== this.passwordForm.confirm) {
      this.setStatus('danger', 'Las contrasenas no coinciden.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*']).{6,}$/;
    if (!passwordRegex.test(this.passwordForm.next)) {
      this.setStatus(
        'danger',
        "La contrasena debe tener al menos 6 caracteres, una mayuscula, un numero y un caracter especial (? ! * ')"
      );
      return;
    }

    try {
      await this.authService.updatePassword(this.user.email, this.passwordForm.next);
      this.setStatus('success', 'Contrasena cambiada.');
      this.showPasswordSection = false;
      this.resetPasswordForm();
    } catch {
      this.setStatus('danger', 'No se pudo actualizar la contrasena. Reautenticate e intentalo de nuevo.');
    }
  }

  private resetPasswordForm(): void {
    this.passwordForm = {
      current: '',
      next: '',
      confirm: ''
    };
  }

  getHeaderGreeting(): string {
    if (!this.user.email && !this.user.nombre && !this.user.apellidos) {
      return 'Hola';
    }

    const fullName = `${this.user.nombre || ''} ${this.user.apellidos || ''}`.trim();
    return fullName ? `Hola ${fullName}` : `Hola ${this.user.email}`;
  }

  getReservationsForUser(): ReservationItem[] {
    return [...this.userReservations].sort(
      (a, b) => new Date(String(b.entrada || '')).getTime() - new Date(String(a.entrada || '')).getTime()
    );
  }

  hasReservations(): boolean {
    return this.getReservationsForUser().length > 0;
  }

  getRoomByName(roomName: string): AdminItem | undefined {
    return (this.adminDb['rooms'] || []).find((room) => String(room['nombre'] || '') === roomName);
  }

  private parseDate(rawDate: string): Date {
    if (rawDate.includes('/')) {
      const iso = rawDate.split('/').reverse().join('-');
      return new Date(iso);
    }

    return new Date(rawDate);
  }

  getReservationTotal(reservation: ReservationItem): string {
    const roomNames = String(reservation.habitacion || reservation.id || '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    const firstRoomName = roomNames[0] || '';
    const room = this.getRoomByName(firstRoomName);

    if (!room) {
      return '-';
    }

    const checkin = this.parseDate(String(reservation.entrada || ''));
    const checkout = this.parseDate(String(reservation.salida || ''));
    const nights = Math.max(1, Math.ceil(Math.abs(checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24)));
    const roomPrice = Number(room['precio'] || 0);

    if (!Number.isFinite(roomPrice) || roomPrice <= 0) {
      return '-';
    }

    return `${roomPrice * nights} EUR`;
  }

  getReservationImage(reservation: ReservationItem): string {
    const firstRoomName = String(reservation.habitacion || reservation.id || '')
      .split(',')[0]
      ?.trim();

    if (!firstRoomName) {
      return '';
    }

    const room = this.getRoomByName(firstRoomName);
    return room ? String(room['imagen'] || '') : '';
  }

  isFutureReservation(reservation: ReservationItem): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkin = this.parseDate(String(reservation.entrada || ''));
    checkin.setHours(0, 0, 0, 0);

    return checkin >= today;
  }

  cancelReservation(reservation: ReservationItem): void {
    this.pendingReservationToCancel = reservation;
  }

  closeCancelModal(): void {
    this.pendingReservationToCancel = null;
  }

  async confirmCancelReservation(): Promise<void> {
    if (!this.pendingReservationToCancel) {
      return;
    }

    const reservationId = String((this.pendingReservationToCancel as Record<string, unknown>)['id'] || '');
    this.pendingReservationToCancel = null;

    if (!reservationId) {
      this.modalMessage = 'No se pudo cancelar la reserva: falta el identificador.';
      return;
    }

    try {
      await this.adminDataService.deleteItemById('reservations', reservationId);
      this.userReservations = this.userReservations.filter(
        (reservation) => String((reservation as Record<string, unknown>)['id'] || '') !== reservationId
      );
      this.requestViewRefresh();
    } catch {
      this.modalMessage = 'No se pudo cancelar la reserva. Intentalo de nuevo.';
    }
  }

  closeMessageModal(): void {
    this.modalMessage = '';
  }

  async goToBooking(): Promise<void> {
    await this.router.navigateByUrl('/booking');
  }

  ngOnDestroy(): void {
    // no-op
  }

  private syncVisibleReservations(): void {
    const email = this.getActiveUserEmail();
    console.log('syncVisibleReservations called. Active User Email:', email);
    console.log('All Reservations:', this.allReservations);

    if (!email) {
      this.userReservations = [];
      this.requestViewRefresh();
      console.log('No active email, userReservations cleared.');
      return;
    }
    this.userReservations = this.allReservations.filter(
      (reservation) => String(reservation.email || '').trim().toLowerCase() === email
    );
    console.log('Filtered User Reservations:', this.userReservations);
    this.requestViewRefresh();
  }

  private getActiveUserEmail(): string {
    const email = String(this.user?.email || this.authService.getLoggedUserEmail() || localStorage.getItem('loggedUserEmail') || '')
      .trim()
      .toLowerCase();
    console.log('getActiveUserEmail returning:', email);
    return email;
  }

  private setStatus(type: 'success' | 'danger', message: string): void {
    this.statusType = type;
    this.statusMessage = message;
  }

  private clearStatus(): void {
    this.statusType = '';
    this.statusMessage = '';
  }

  private setSavingData(value: boolean): void {
    if (this.savingDataWatchdog) {
      clearTimeout(this.savingDataWatchdog);
      this.savingDataWatchdog = null;
    }

    this.ngZone.run(() => {
      this.isSavingData = value;
    });

    if (value) {
      this.savingDataWatchdog = setTimeout(() => {
        this.ngZone.run(() => {
          this.isSavingData = false;
        });
        this.requestViewRefresh();
      }, 15000);
    }

    this.requestViewRefresh();
  }

  private normalizeBirthDate(rawDate: string): string {
    const value = String(rawDate || '').trim();
    if (!value) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/');
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private setEditingData(value: boolean): void {
    this.ngZone.run(() => {
      this.isEditingData = value;
    });
    this.requestViewRefresh();
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }
  }

  private requestViewRefresh(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // no-op
    }
  }
}
