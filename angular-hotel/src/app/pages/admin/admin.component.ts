import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService, AdminItem, CrudSectionId } from '../../services/admin-data.service';

interface AdminField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'textarea' | 'select';
  options?: string[];
  optionsFromSection?: CrudSectionId;
  optionsFromKey?: string;
}

interface AdminSection {
  id: CrudSectionId;
  label: string;
  fields: AdminField[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private readonly adminDataService = inject(AdminDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  readonly sections: AdminSection[] = [
    {
      id: 'rooms',
      label: 'Habitaciones',
      fields: [
        { key: 'nombre', label: 'Nombre', type: 'text' },
        { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        { key: 'huespedes', label: 'Huéspedes', type: 'number' },
        { key: 'precio', label: 'Precio', type: 'number' },
        { key: 'imagen', label: 'URL Imagen', type: 'text' }
      ]
    },
    {
      id: 'restaurant',
      label: 'Restauración',
      fields: [
        { key: 'nombre', label: 'Nombre', type: 'text' },
        { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        { key: 'categoria', label: 'Categoría', type: 'select', options: ['entrantes', 'primeros', 'segundos', 'postres'] },
        { key: 'imagen', label: 'URL Imagen', type: 'text' }
      ]
    },
    {
      id: 'activities',
      label: 'Actividades',
      fields: [
        { key: 'nombre', label: 'Nombre', type: 'text' },
        { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        { key: 'duracion', label: 'Duración', type: 'text' },
        { key: 'imagen', label: 'URL Imagen', type: 'text' }
      ]
    },
    {
      id: 'wellness',
      label: 'Bienestar',
      fields: [
        { key: 'nombre', label: 'Nombre', type: 'text' },
        { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        { key: 'imagen', label: 'URL Imagen', type: 'text' }
      ]
    },
    {
      id: 'reservations',
      label: 'Reservas',
      fields: [
        { key: 'cliente', label: 'Cliente', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'telefono', label: 'Teléfono', type: 'text' },
        { key: 'dni', label: 'DNI / Pasaporte', type: 'text' },
        { key: 'habitacion', label: 'Habitación', type: 'text' },
        { key: 'entrada', label: 'Entrada', type: 'date' },
        { key: 'salida', label: 'Salida', type: 'date' },
        { key: 'huespedes', label: 'Huéspedes', type: 'number' }
      ]
    }
  ];

  currentSectionId: CrudSectionId = 'rooms';
  rowsBySection: Record<CrudSectionId, AdminItem[]> = {
    rooms: [], restaurant: [], activities: [], wellness: [], reservations: []
  };

  createForm: Record<string, string> = {};
  editForm: Record<string, string> = {};
  editingId = '';
  saving = false;
  statusMessage = '';
  statusType: 'success' | 'danger' = 'success';
  createErrorMessage = '';
  editErrorMessage = '';

  pendingDelete: AdminItem | null = null;
  pendingAction: 'create' | 'edit' | null = null;

  showCreateForm = false;
  showEditModal = false;
  createValidationVisible = false;
  editValidationVisible = false;

  selectedImageModal: string | null = null;
  restaurantFilter = 'entrantes';

  // --- LÓGICA RESERVAS CLON BOOKING ---
  bookingSearch = { checkin: '', checkout: '', guests: 2, includeFamily: false };
  bookingCheckout = { nombre: '', apellidos: '', email: '', telefono: '', dni: '' };
  adminAvailableRooms: any[] = [];
  adminSelectedRooms: any[] = [];
  adminBookingCapacity = 0;
  adminBookingNights = 0;
  adminBookingError = '';

  adminShowRooms = false;
  adminShowCheckout = false;

  async ngOnInit(): Promise<void> {
    this.sections.forEach((section) => {
      this.adminDataService.watchSection(section.id).subscribe((rows) => {
        this.rowsBySection = { ...this.rowsBySection, [section.id]: rows };
        this.cdr.detectChanges();
      });
    });
    this.resetCreateForm();
    void this.adminDataService.ensureInitialized();
  }

  get currentSection(): AdminSection {
    return this.sections.find((s) => s.id === this.currentSectionId) || this.sections[0];
  }

  get tableFields(): AdminField[] {
    if (this.currentSectionId === 'restaurant') {
      return this.currentSection.fields.filter(f => f.key !== 'categoria');
    }
    return this.currentSection.fields;
  }

  get filteredRows(): AdminItem[] {
    let rows = this.rowsBySection[this.currentSectionId] || [];
    if (this.currentSectionId === 'restaurant') {
      rows = rows.filter(r => String(r['categoria'] || '').toLowerCase() === this.restaurantFilter);
    }
    if (this.currentSectionId === 'reservations') {
      rows = [...rows].sort((a, b) => new Date(String(a['entrada'])).getTime() - new Date(String(b['entrada'])).getTime());
    }
    return rows;
  }

  changeSection(sectionId: CrudSectionId): void {
    this.currentSectionId = sectionId;
    this.cancelEdit();
    this.resetCreateForm();
    this.statusMessage = '';
    this.showCreateForm = false;
    this.createValidationVisible = false;
    this.editValidationVisible = false;
    this.resetAdminBooking();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.createValidationVisible = false;
    if (this.showCreateForm) this.resetAdminBooking();
  }

  openImageModal(url: string | number | null | undefined): void {
    if (url) this.selectedImageModal = String(url);
  }
  closeImageModal(): void {
    this.selectedImageModal = null;
  }

  startEdit(row: AdminItem): void {
    this.editValidationVisible = false;
    this.editingId = String(row['id'] || '');
    this.editForm = {};
    this.currentSection.fields.forEach((field) => {
      this.editForm[field.key] = String(row[field.key] ?? '');
    });
    this.ensureSelectDefaults(this.editForm);
    this.showEditModal = true;
  }

  cancelEdit(): void {
    this.editingId = '';
    this.editForm = {};
    this.showEditModal = false;
    this.editValidationVisible = false;
  }

  async saveEdit(): Promise<void> {
    this.editValidationVisible = true;
    if (!this.validateForm('edit')) return;

    this.saving = true;
    try {
      await this.adminDataService.updateItem(this.currentSection.id, this.editingId, this.coerceValues(this.editForm));
      this.cancelEdit();
      this.setStatus('success', 'Elemento modificado con éxito.');
    } catch (e) {
      this.editErrorMessage = 'Error al intentar guardar los cambios.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  async createItem(): Promise<void> {
    this.saving = true;
    try {
      await this.adminDataService.addItem(this.currentSection.id, this.coerceValues(this.createForm));
      this.resetCreateForm();
      this.showCreateForm = false;
      this.setStatus('success', 'Elemento creado con éxito.');
    } catch (e) {
      this.createErrorMessage = 'Error al intentar crear el elemento.';
    } finally {
      this.saving = false;
      this.pendingAction = null;
      this.cdr.detectChanges();
    }
  }

  requestDelete(row: AdminItem): void { this.pendingDelete = row; }
  cancelDelete(): void { this.pendingDelete = null; }

  async confirmDelete(): Promise<void> {
    if (!this.pendingDelete) return;
    try {
      await this.adminDataService.deleteItemById(this.currentSection.id, String(this.pendingDelete['id']));
      this.setStatus('success', 'Elemento borrado con éxito.');
    } catch (e) {
      this.setStatus('danger', 'Error al intentar borrar el elemento.');
    } finally {
      this.pendingDelete = null;
      this.cdr.detectChanges();
    }
  }

  requestCreate(): void {
    this.createValidationVisible = true;
    if (!this.validateForm('create')) return;
    this.pendingAction = 'create';
  }

  cancelAction(): void { this.pendingAction = null; }
  async confirmAction(): Promise<void> { if (this.pendingAction === 'create') await this.createItem(); }

  // --- MÉTODOS DE FORMULARIO FALTANTES ---

  getFieldOptions(field: AdminField): string[] {
    if (field.optionsFromSection && field.optionsFromKey) {
      const sourceRows = this.rowsBySection[field.optionsFromSection] || [];
      return sourceRows
        .map((row) => String(row[field.optionsFromKey || ''] || '').trim())
        .filter(Boolean);
    }
    return field.options || [];
  }

  isCreateFieldInvalid(field: AdminField): boolean {
    if (!this.createValidationVisible) return false;
    return !this.hasValue(this.createForm[field.key]);
  }

  isEditFieldInvalid(field: AdminField): boolean {
    if (!this.editValidationVisible) return false;
    return !this.hasValue(this.editForm[field.key]);
  }

  private hasValue(value: string | undefined): boolean {
    return String(value || '').trim().length > 0;
  }

  private ensureSelectDefaults(formTarget: Record<string, string>): void {
    this.currentSection.fields.forEach((field) => {
      if (field.type !== 'select') return;
      const options = this.getFieldOptions(field);
      const current = String(formTarget[field.key] || '');
      if (!options.includes(current)) {
        formTarget[field.key] = '';
      }
    });
  }

  private validateForm(mode: 'create' | 'edit'): boolean {
    const formValues = mode === 'create' ? this.createForm : this.editForm;
    const missingField = this.currentSection.fields.find((field) => !this.hasValue(formValues[field.key]));
    if (missingField) {
      const message = 'Todos los campos son obligatorios.';
      this.setStatus('danger', message);
      if (mode === 'create') {
        this.createErrorMessage = message;
      } else {
        this.editErrorMessage = message;
      }
      return false;
    }
    return true;
  }

  // --- LÓGICA RESERVAS CLON BOOKING ---
  resetAdminBooking(): void {
    this.bookingSearch = { checkin: '', checkout: '', guests: 2, includeFamily: false };
    this.bookingCheckout = { nombre: '', apellidos: '', email: '', telefono: '', dni: '' };
    this.adminSelectedRooms = [];
    this.adminBookingCapacity = 0;
    this.adminBookingError = '';
    this.adminShowRooms = false;
    this.adminShowCheckout = false;
  }

  searchAdminRooms(): void {
    if (!this.bookingSearch.checkin || !this.bookingSearch.checkout) {
      this.adminBookingError = 'Por favor, selecciona las fechas de entrada y salida.';
      return;
    }

    const inDate = new Date(this.bookingSearch.checkin);
    const outDate = new Date(this.bookingSearch.checkout);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime()) || inDate >= outDate) {
      this.adminBookingError = 'Fechas no válidas. La entrada debe ser anterior a la salida.';
      return;
    }

    this.bookingSearch.guests = Number(this.bookingSearch.guests);
    if (this.bookingSearch.guests < 1) {
      this.adminBookingError = 'El número de huéspedes debe ser al menos 1.';
      return;
    }

    this.adminBookingError = '';
    this.adminBookingNights = Math.ceil(Math.abs(outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));

    let rooms = this.rowsBySection['rooms'] || [];
    if (rooms.length === 0) {
      this.adminBookingError = 'No hay habitaciones registradas en la base de datos para mostrar.';
      return;
    }

    if (!this.bookingSearch.includeFamily) {
      rooms = rooms.filter(r => String(r['id']) !== 'familiar' && !String(r['nombre']).toLowerCase().includes('familiar'));
    }

    this.adminAvailableRooms = rooms;
    this.adminSelectedRooms = [];
    this.adminBookingCapacity = 0;
    this.adminShowRooms = true;
    this.adminShowCheckout = false;
  }

  toggleAdminRoom(room: any): void {
    const idx = this.adminSelectedRooms.findIndex(r => r.id === room.id);
    if (idx > -1) {
      this.adminBookingCapacity -= Number(room.huespedes || 0);
      this.adminSelectedRooms.splice(idx, 1);
    } else {
      if (this.adminBookingCapacity < this.bookingSearch.guests) {
        this.adminSelectedRooms.push(room);
        this.adminBookingCapacity += Number(room.huespedes || 0);
      }
    }

    this.adminShowCheckout = this.adminBookingCapacity >= this.bookingSearch.guests;
  }

  isRoomSelected(room: any): boolean {
    return this.adminSelectedRooms.some(r => r.id === room.id);
  }

  get adminTotalBookingPrice(): number {
    return this.adminSelectedRooms.reduce((acc, r) => acc + (Number(r.precio) * this.adminBookingNights), 0);
  }

  async confirmAdminBooking(): Promise<void> {
    if (!this.bookingCheckout.nombre || !this.bookingCheckout.apellidos || !this.bookingCheckout.email) {
      this.adminBookingError = 'Por favor, rellena todos los campos obligatorios.';
      return;
    }

    this.saving = true;
    try {
      const roomNames = this.adminSelectedRooms.map(r => r.nombre).join(', ');
      const newRes = {
        cliente: `${this.bookingCheckout.nombre} ${this.bookingCheckout.apellidos}`.trim(),
        nombre: this.bookingCheckout.nombre,
        apellidos: this.bookingCheckout.apellidos,
        email: this.bookingCheckout.email,
        telefono: this.bookingCheckout.telefono,
        dni: this.bookingCheckout.dni,
        habitacion: roomNames,
        entrada: this.bookingSearch.checkin,
        salida: this.bookingSearch.checkout,
        huespedes: this.bookingSearch.guests,
        createdAt: new Date().toISOString()
      };

      await this.adminDataService.addItem('reservations', newRes);
      this.setStatus('success', '¡Reserva creada con éxito!');
      this.showCreateForm = false;
      this.resetAdminBooking();
    } catch (e) {
      this.adminBookingError = 'Error al intentar crear la reserva.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  // --- UTILS ---
  getFieldString(row: AdminItem, key: string): string { return String(row[key] ?? ''); }

  private coerceValues(values: Record<string, string>): AdminItem {
    const output: AdminItem = {};
    this.currentSection.fields.forEach((field) => {
      const raw = String(values[field.key] || '').trim();
      if (field.type === 'number') output[field.key] = Number(raw) || 0;
      else output[field.key] = raw;
    });
    return output;
  }

  private resetCreateForm(): void {
    this.createForm = {};
    this.createValidationVisible = false;
    this.currentSection.fields.forEach((field) => this.createForm[field.key] = '');
    this.ensureSelectDefaults(this.createForm);
  }

  private setStatus(type: 'success' | 'danger', message: string): void {
    this.statusType = type;
    this.statusMessage = message;
    setTimeout(() => { this.statusMessage = ''; this.cdr.detectChanges(); }, 5000);
  }
}
