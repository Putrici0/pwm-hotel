import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, doc, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService } from '../../services/admin-data.service';
import { AuthService } from '../../services/auth.service';
import { SiteDataService } from '../../services/site-data.service';

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
export class AccountComponent implements OnInit {
  private readonly siteDataService = inject(SiteDataService);
  private readonly authService = inject(AuthService);
  private readonly adminDataService = inject(AdminDataService);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);

  private userUid = '';

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

  user: AccountUser | null = null;
  adminDb: AdminDb = {};
  userReservations: ReservationItem[] = [];

  isEditingData = false;
  showPasswordSection = false;

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
    await this.initializeUserAndData();
    void this.adminDataService.ensureInitialized().then(() => {
      this.adminDb = this.adminDataService.getDb();
      this.adminDataService.watchSection('rooms').subscribe((rooms) => {
        this.adminDb = {
          ...this.adminDb,
          rooms
        };
      });
      if (this.user?.email) {
        this.adminDataService.getUserReservations(this.user.email).subscribe((reservations) => {
          this.userReservations = reservations as ReservationItem[];
        });
      }
    });

    this.siteDataService
      .getSection<any>('account')
      .pipe(catchError(() => of(this.defaultAccountConfig)))
      .subscribe((data) => {
        this.accountConfig = data || this.defaultAccountConfig;
      });

    if (!this.accountConfig) {
      this.accountConfig = this.defaultAccountConfig;
    }
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
    this.syncEditableData();
  }

  private async initializeUserAndData(): Promise<void> {
    this.userUid = this.authService.getLoggedUserUid();
    let loggedEmail = this.authService.getLoggedUserEmail() || localStorage.getItem('loggedUserEmail') || '';

    if (!loggedEmail) {
      loggedEmail = 'user@ulpgc.es';
      localStorage.setItem('loggedUserEmail', loggedEmail);
    }

    const baseUser: AccountUser = {
      nombre: '',
      apellidos: '',
      email: loggedEmail,
      dni: '',
      nacimiento: ''
    };

    if (!this.userUid) {
      this.user = baseUser;
      this.syncEditableData();
      this.adminDb = this.adminDataService.getDb();
      return;
    }

    try {
      const userRef = doc(this.firestore, 'users', this.userUid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        await setDoc(
          userRef,
          {
            email: loggedEmail,
            isAdmin: false,
            nombre: '',
            apellidos: '',
            dni: '',
            nacimiento: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        this.user = baseUser;
      } else {
        const userData = userSnapshot.data() as UserProfileDocument;
        this.user = {
          nombre: String(userData.nombre || ''),
          apellidos: String(userData.apellidos || ''),
          email: String(userData.email || loggedEmail),
          dni: String(userData.dni || ''),
          nacimiento: String(userData.nacimiento || '')
        };
      }
    } catch {
      this.user = baseUser;
    }

    this.syncEditableData();
    this.adminDb = this.adminDataService.getDb();
  }

  private syncEditableData(): void {
    this.editableData = {
      nombre: this.user?.nombre || '',
      apellidos: this.user?.apellidos || '',
      dni: this.user?.dni || '',
      nacimiento: this.user?.nacimiento || ''
    };
  }

  enableDataEdit(): void {
    this.isEditingData = true;
  }

  async saveData(): Promise<void> {
    if (!this.user || !this.userUid) {
      return;
    }

    this.user = {
      ...this.user,
      nombre: this.editableData.nombre,
      apellidos: this.editableData.apellidos,
      dni: this.editableData.dni,
      nacimiento: this.editableData.nacimiento
    };

    try {
      await setDoc(
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
      );
      window.alert('Datos guardados.');
      this.isEditingData = false;
    } catch {
      window.alert('No se pudieron guardar los datos en Firestore.');
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
    if (!this.user) {
      return;
    }

    if (this.passwordForm.next !== this.passwordForm.confirm) {
      window.alert('Las contrasenas no coinciden.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*']).{6,}$/;
    if (!passwordRegex.test(this.passwordForm.next)) {
      window.alert(
        "La contrasena debe tener al menos 6 caracteres, una mayuscula, un numero y un caracter especial (? ! * ')"
      );
      return;
    }

    try {
      await this.authService.updatePassword(this.user.email, this.passwordForm.next);
      window.alert('Contrasena cambiada.');
      this.showPasswordSection = false;
      this.resetPasswordForm();
    } catch {
      window.alert('No se pudo actualizar la contrasena. Reautenticate e intentalo de nuevo.');
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
    if (!this.user) {
      return 'Hola';
    }

    const fullName = `${this.user.nombre || ''} ${this.user.apellidos || ''}`.trim();
    return fullName ? `Hola ${fullName}` : `Hola ${this.user.email}`;
  }

  getReservationsForUser(): ReservationItem[] {
    if (!this.user) {
      return [];
    }

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
    if (!this.user) {
      return;
    }

    if (!window.confirm('Cancelar reserva?')) {
      return;
    }

    const reservationId = String((reservation as Record<string, unknown>)['id'] || '');
    if (!reservationId) {
      window.alert('No se pudo cancelar la reserva: falta el identificador.');
      return;
    }

    void this.adminDataService.deleteItemById('reservations', reservationId);
  }

  async goToBooking(): Promise<void> {
    await this.router.navigateByUrl('/booking');
  }
}
