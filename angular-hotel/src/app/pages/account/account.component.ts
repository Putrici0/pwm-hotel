import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { Firestore, doc, getDoc, serverTimestamp, setDoc, collection, query, where, onSnapshot } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, filter, Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {IonContent, IonHeader} from '@ionic/angular/standalone';
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
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, IonContent, IonHeader],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly adminDataService = inject(AdminDataService);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  private userUid = '';
  private destroy$ = new Subject<void>();

  accountConfig: any = null;
  private readonly defaultAccountConfig = {
    title: {
      title: 'Tu cuenta',
      description: 'Aquí puedes actualizar tus datos personales y gestionar tu actividad.'
    },
    actions: {
      buttons: ['Cambiar tus datos', 'Guardar Cambios', 'Cambiar contraseña']
    }
  };

  currentTab: AccountTabId = 'datos';
  user: AccountUser = { nombre: '', apellidos: '', email: '', dni: '', nacimiento: '' };
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

  editableData = { nombre: '', apellidos: '', dni: '', nacimiento: '' };
  passwordForm = { current: '', next: '', confirm: '' };

  readonly discounts = [
    { code: 'RESTAURANTE20', description: '20% de descuento en el Menú Fijo.' },
    { code: 'ACTIVIDAD15', description: '15% de descuento en actividades.' },
    { code: 'SPARELAX', description: '1 hora de Spa gratis.' }
  ];

  // --- LÓGICA DE PESTAÑAS (TABS) PARA ADMIN vs USUARIO ---
  get tabs(): Array<{ id: AccountTabId; label: string }> {
    if (this.authService.isAdmin()) {
      return [
        { id: 'datos' as AccountTabId, label: 'Tus datos' },
        { id: 'admin', label: 'Panel de Admin' }
      ];
    } else {
      return [
        { id: 'datos' as AccountTabId, label: 'Consultar tus datos' },
        { id: 'reservas' as AccountTabId, label: 'Consultar tus reservas' },
        { id: 'descuentos' as AccountTabId, label: 'Consultar descuentos' }
      ];
    }
  }

  async ngOnInit(): Promise<void> {
    this.accountConfig = this.defaultAccountConfig;
    await this.adminDataService.ensureInitialized();
    await this.initializeUserProfileData();

    if (!this.authService.isAdmin()) {
      combineLatest([
        this.authService.loggedUserEmail$.pipe(filter(email => !!email)),
        this.getUserReservationsObservable()
      ]).pipe(
        takeUntil(this.destroy$)
      ).subscribe(([userEmail, reservations]) => {
        this.ngZone.run(() => {
          this.user.email = userEmail || '';
          this.allReservations = reservations as ReservationItem[];
          this.syncVisibleReservations(userEmail || '');
          this.cdr.detectChanges();
        });
      });
    }

    this.adminDataService.watchSection('rooms').pipe(
      takeUntil(this.destroy$)
    ).subscribe((rooms) => {
      this.ngZone.run(() => {
        this.adminDb = { ...this.adminDb, rooms };
        this.cdr.detectChanges();
      });
    });
  }

  private getUserReservationsObservable(): Observable<ReservationItem[]> {
    return new Observable<ReservationItem[]>(subscriber => {
      const email = this.authService.getLoggedUserEmail();
      if (!email) {
        subscriber.next([]);
        return;
      }
      const resRef = collection(this.firestore, 'reservations');
      const q = query(resRef, where('email', '==', email));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ReservationItem[];
        subscriber.next(items);
      }, (error) => {
        console.error("Firestore Error:", error);
        subscriber.next([]);
      });
      return () => unsubscribe();
    });
  }

  private async initializeUserProfileData(): Promise<void> {
    this.isLoadingUser = true;
    await this.authService.waitForSessionReady();
    this.userUid = this.authService.getLoggedUserUid();
    this.user.email = this.authService.getLoggedUserEmail();

    if (!this.userUid) {
      this.isLoadingUser = false;
      return;
    }

    try {
      const userRef = doc(this.firestore, 'users', this.userUid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as UserProfileDocument;
        this.user = {
          ...this.user,
          nombre: String(userData.nombre || ''),
          apellidos: String(userData.apellidos || ''),
          dni: String(userData.dni || ''),
          nacimiento: this.normalizeBirthDate(String(userData.nacimiento || ''))
        };
      }
      this.syncEditableData();
    } catch (error) {
      this.userLoadError = 'Error al cargar los datos del perfil.';
    } finally {
      this.isLoadingUser = false;
      this.cdr.detectChanges();
    }
  }

  private syncVisibleReservations(currentAuthEmail: string): void {
    const email = currentAuthEmail.trim().toLowerCase();
    if (!email) {
      this.userReservations = [];
    } else {
      this.userReservations = this.allReservations.filter(
        (res) => String(res.email || '').trim().toLowerCase() === email
      );
    }
    this.cdr.detectChanges();
  }

  // --- MÉTODOS DE CÁLCULO DE RESERVAS MÚLTIPLES ---

  getReservationTotal(reservation: ReservationItem): string {
    const checkin = new Date(String(reservation.entrada));
    const checkout = new Date(String(reservation.salida));
    const diff = Math.abs(checkout.getTime() - checkin.getTime());
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;

    const roomNames = String(reservation.habitacion || '').split(',').map(n => n.trim());
    let totalPrice = 0;

    roomNames.forEach(name => {
      const room = this.getRoomByName(name);
      if (room) {
        totalPrice += (Number(room['precio'] || 0) * nights);
      }
    });

    return totalPrice > 0 ? `${totalPrice} EUR` : '-';
  }

  getReservationImage(reservation: ReservationItem): string {
    const roomNames = String(reservation.habitacion || '').split(',').map(n => n.trim());
    const firstRoom = this.getRoomByName(roomNames[0]);
    return firstRoom ? String(firstRoom['imagen'] || '') : 'assets/img/default-room.jpg';
  }

  getRoomByName(name: string): AdminItem | undefined {
    return (this.adminDb['rooms'] || []).find(r => String(r['nombre']).trim() === name.trim());
  }

  isFutureReservation(reservation: ReservationItem): boolean {
    const checkin = new Date(String(reservation.entrada));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkin >= today;
  }

  hasReservations(): boolean {
    return this.userReservations.length > 0;
  }

  getReservationsForUser(): ReservationItem[] {
    return [...this.userReservations].sort(
      (a, b) => new Date(String(b.entrada)).getTime() - new Date(String(a.entrada)).getTime()
    );
  }

  // --- ACCIONES DE FORMULARIO ---

  enableDataEdit(): void { this.isEditingData = true; }

  syncEditableData(): void {
    this.editableData = {
      nombre: this.user.nombre,
      apellidos: this.user.apellidos,
      dni: this.user.dni || '',
      nacimiento: this.user.nacimiento || ''
    };
  }

  async saveData(): Promise<void> {
    if (!this.userUid) return;
    this.isSavingData = true;
    try {
      await setDoc(doc(this.firestore, 'users', this.userUid), {
        ...this.editableData,
        email: this.user.email,
        updatedAt: serverTimestamp()
      }, { merge: true });

      this.user = { ...this.user, ...this.editableData };
      this.setStatus('success', 'Datos guardados correctamente.');
      this.isEditingData = false;
    } catch {
      this.setStatus('danger', 'Error al guardar los datos.');
    } finally {
      this.isSavingData = false;
      this.cdr.detectChanges();
    }
  }

  async updatePassword(): Promise<void> {
    if (this.passwordForm.next !== this.passwordForm.confirm) {
      this.setStatus('danger', 'Las contraseñas no coinciden.');
      return;
    }
    try {
      await this.authService.updatePassword(this.user.email, this.passwordForm.next);
      this.setStatus('success', 'Se ha enviado un correo para restablecer tu contraseña.');
      this.showPasswordSection = false;
    } catch {
      this.setStatus('danger', 'Error al intentar cambiar la contraseña.');
    }
  }

  setTab(tabId: AccountTabId): void {
    if (tabId === 'admin') { this.router.navigateByUrl('/admin'); return; }
    this.currentTab = tabId;
    this.isEditingData = false;
    this.showPasswordSection = false;
  }

  getHeaderGreeting(): string {
    const name = this.user.nombre || this.user.email;
    return `Hola, ${name}`;
  }

  cancelReservation(reservation: ReservationItem): void { this.pendingReservationToCancel = reservation; }
  closeCancelModal(): void { this.pendingReservationToCancel = null; }

  async confirmCancelReservation(): Promise<void> {
    if (!this.pendingReservationToCancel?.id) return;
    try {
      await this.adminDataService.deleteItemById('reservations', this.pendingReservationToCancel.id);
      this.closeCancelModal();
    } catch {
      this.modalMessage = 'No se pudo cancelar la reserva.';
    }
  }

  private setStatus(type: 'success' | 'danger', msg: string): void {
    this.statusType = type;
    this.statusMessage = msg;
    setTimeout(() => { this.statusMessage = ''; this.cdr.detectChanges(); }, 5000);
  }

  private normalizeBirthDate(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }

  openPasswordSection(): void { this.showPasswordSection = true; this.isEditingData = false; }
  cancelPasswordChange(): void { this.showPasswordSection = false; }
  closeMessageModal(): void { this.modalMessage = ''; }
  async goToBooking(): Promise<void> { await this.router.navigateByUrl('/booking'); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
