import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
  password: string;
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

type AccountTabId = 'datos' | 'reservas' | 'descuentos';

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
  private readonly router = inject(Router);

  accountConfig: any = null;
  private readonly defaultAccountConfig = {
    title: {
      title: 'Tu cuenta',
      description: 'Aquí puedes ver tus reservas, consultar tus descuentos y actualizar tus datos personales.'
    },
    actions: {
      buttons: ['Cambiar tus datos', 'Guardar Cambios', 'Cambiar contraseña']
    },
    users: []
  };
  currentTab: AccountTabId = 'datos';

  user: AccountUser | null = null;
  adminDb: AdminDb = {};

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

  readonly tabs: Array<{ id: AccountTabId; label: string }> = [
    { id: 'datos', label: 'Consultar tus datos' },
    { id: 'reservas', label: 'Consultar tus reservas' },
    { id: 'descuentos', label: 'Consultar los descuentos reservados a ti' }
  ];

  readonly discounts = [
    { code: 'RESTAURANTE20', description: '20% de descuento en el Menú Fijo.' },
    { code: 'ACTIVIDAD15', description: '15% de descuento en actividades.' },
    { code: 'SPARELAX', description: '1 hora de Spa gratis.' }
  ];

  async ngOnInit(): Promise<void> {
    this.initializeUserAndData();
    void this.adminDataService
      .ensureInitialized()
      .then(() => {
        this.adminDb = this.adminDataService.getDb();
      })
      .catch(() => {
        this.adminDb = this.adminDataService.getDb();
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
    this.currentTab = tabId;
    this.isEditingData = false;
    this.showPasswordSection = false;
    this.resetPasswordForm();
    this.syncEditableData();
  }

  private initializeUserAndData(): void {
    let loggedEmail = this.authService.getLoggedUserEmail() || localStorage.getItem('loggedUserEmail') || '';

    if (!loggedEmail) {
      loggedEmail = 'user@ulpgc.es';
      localStorage.setItem('loggedUserEmail', loggedEmail);
    }

    const users = this.getStoredUsers();
    let currentUser = users.find((candidate) => candidate.email === loggedEmail) || null;

    if (!currentUser) {
      currentUser = {
        nombre: 'Estudiante',
        apellidos: 'ULPGC',
        email: loggedEmail,
        password: 'Password123!',
        dni: '',
        nacimiento: ''
      };

      users.push(currentUser);
      this.saveStoredUsers(users);
    }

    this.user = { ...currentUser };
    this.syncEditableData();
    this.adminDb = this.adminDataService.getDb();
  }

  private getStoredUsers(): AccountUser[] {
    const raw = localStorage.getItem('hotelUsers');

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as AccountUser[]) : [];
    } catch {
      return [];
    }
  }

  private saveStoredUsers(users: AccountUser[]): void {
    localStorage.setItem('hotelUsers', JSON.stringify(users));
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

  saveData(): void {
    if (!this.user) {
      return;
    }

    this.user = {
      ...this.user,
      nombre: this.editableData.nombre,
      apellidos: this.editableData.apellidos,
      dni: this.editableData.dni,
      nacimiento: this.editableData.nacimiento
    };

    const users = this.getStoredUsers();
    const userIndex = users.findIndex((candidate) => candidate.email === this.user?.email);

    if (userIndex >= 0) {
      users[userIndex] = this.user;
      this.saveStoredUsers(users);
    }

    window.alert('Datos guardados.');
    this.isEditingData = false;
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

  updatePassword(): void {
    if (!this.user) {
      return;
    }

    if (this.passwordForm.current !== this.user.password) {
      window.alert('Contraseña actual incorrecta.');
      return;
    }

    if (this.passwordForm.next !== this.passwordForm.confirm) {
      window.alert('Las contraseñas no coinciden.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*']).{6,}$/;
    if (!passwordRegex.test(this.passwordForm.next)) {
      window.alert(
        "La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial (? ! * ')"
      );
      return;
    }

    this.user = {
      ...this.user,
      password: this.passwordForm.next
    };

    const users = this.getStoredUsers();
    const userIndex = users.findIndex((candidate) => candidate.email === this.user?.email);
    if (userIndex >= 0) {
      users[userIndex] = this.user;
      this.saveStoredUsers(users);
    }

    window.alert('Contraseña cambiada.');
    this.showPasswordSection = false;
    this.resetPasswordForm();
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

    return `Hola ${this.user.nombre} ${this.user.apellidos}`;
  }

  getReservationsForUser(): ReservationItem[] {
    if (!this.user || !this.accountConfig) {
      return [];
    }

    const jsonUser = Array.isArray(this.accountConfig?.users)
      ? this.accountConfig.users.find((candidate: any) => candidate.email === this.user?.email)
      : null;

    const jsonReservations = jsonUser?.reservations || [];
    const adminReservations = (this.adminDb['reservations'] || []).filter(
      (reservation) => String(reservation['email'] || '') === this.user?.email
    );

    const merged = [...jsonReservations, ...adminReservations] as ReservationItem[];
    return merged.sort(
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

    return `${roomPrice * nights} €`;
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

    if (!window.confirm('¿Cancelar reserva?')) {
      return;
    }

    const nextReservations = (this.adminDb['reservations'] || []).filter((item) => {
      return !(
        String(item['email'] || '') === this.user?.email &&
        String(item['entrada'] || '') === String(reservation.entrada || '') &&
        String(item['habitacion'] || item['id'] || '') === String(reservation.habitacion || reservation.id || '')
      );
    });

    this.adminDb = {
      ...this.adminDb,
      reservations: nextReservations
    };

    this.adminDataService.saveDb(this.adminDb);
  }

  async goToBooking(): Promise<void> {
    await this.router.navigateByUrl('/booking');
  }
}
