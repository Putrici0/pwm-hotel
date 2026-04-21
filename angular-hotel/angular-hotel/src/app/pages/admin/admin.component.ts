import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService } from '../../services/admin-data.service';
import { SiteDataService } from '../../services/site-data.service';

interface AdminField {
  name: string;
  label: string;
  type: string;
}

interface AdminSection {
  id: string;
  title: string;
  fields: AdminField[];
}

interface BookingConfig {
  availability?: {
    defaultCheckin?: string;
    defaultCheckout?: string;
    defaultGuests?: number;
  };
}

type AdminValue = string | number | null | undefined;
type AdminItem = Record<string, AdminValue>;
type AdminDb = Record<string, AdminItem[]>;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private readonly siteDataService = inject(SiteDataService);
  private readonly adminDataService = inject(AdminDataService);

  adminTitle: { title: string; description: string } | null = null;
  sections: AdminSection[] = [];
  db: AdminDb = {};
  bookingConfig: BookingConfig | null = null;

  currentSectionId = 'rooms';

  servicesFilter = 'bienestar';
  reservationsFilter = 'proximas';
  menusFilter = 'entrantes';
  reservationsCustomDate = '';

  formsOpenBySection: Record<string, boolean> = {};
  newItemValues: Record<string, Record<string, string>> = {};
  fileLabels: Record<string, Record<string, string>> = {};

  editingSectionId: string | null = null;
  editingRealIndex = -1;
  editValues: Record<string, string> = {};
  editFileBase64 = '';
  editFileLabel = 'CAMBIAR IMAGEN';

  modalImageSrc = '';

  bookingSearch = {
    checkin: '',
    checkout: '',
    guests: 1,
    includeFamilySuite: false
  };
  bookingCandidates: AdminItem[] = [];
  selectedCandidateIndexes = new Set<number>();
  currentCapacity = 0;
  requestedGuests = 0;
  totalNights = 0;
  bookingStatusMessage = '';
  bookingStatusType: 'default' | 'warning' | 'success' = 'default';
  showBookingRoomList = false;
  showBookingCheckout = false;
  bookingFinal = { name: '', lastName: '', email: '' };

  async ngOnInit(): Promise<void> {
    await this.adminDataService.ensureInitialized();
    this.db = this.adminDataService.getDb();

    this.siteDataService.getSection<any>('admin').subscribe((adminConfig) => {
      this.adminTitle = adminConfig?.title || null;
      this.sections = adminConfig?.sections || [];

      if (this.sections.length > 0 && !this.sections.some((section) => section.id === this.currentSectionId)) {
        this.currentSectionId = this.sections[0].id;
      }

      this.sections.forEach((section) => this.ensureSectionState(section));
    });

    this.siteDataService.getSection<BookingConfig>('booking').subscribe((bookingConfig) => {
      this.bookingConfig = bookingConfig;
      this.resetBookingWidget();
    });
  }

  get activeSection(): AdminSection | null {
    return this.sections.find((section) => section.id === this.currentSectionId) || null;
  }

  setCurrentSection(sectionId: string): void {
    this.currentSectionId = sectionId;
    this.cancelEdit();
  }

  getVisibleFields(section: AdminSection): AdminField[] {
    return section.fields.filter((field) => {
      if (section.id === 'services' && field.name === 'tipo') {
        return false;
      }

      if (section.id === 'menus' && field.name === 'categoria') {
        return false;
      }

      return true;
    });
  }

  getFilteredItems(sectionId: string): AdminItem[] {
    let items = [...(this.db[sectionId] || [])];

    if (sectionId === 'services') {
      return items.filter((service) => String(service['tipo'] || '') === this.servicesFilter);
    }

    if (sectionId === 'menus') {
      return items.filter((menu) => String(menu['categoria'] || '') === this.menusFilter);
    }

    if (sectionId === 'reservations') {
      items = items.filter((reservation) => {
        const reservationDate = new Date(String(reservation['entrada'] || ''));
        reservationDate.setHours(0, 0, 0, 0);

        if (Number.isNaN(reservationDate.getTime())) {
          return false;
        }

        if (this.reservationsFilter === 'proximas') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return reservationDate >= today;
        }

        if (this.reservationsFilter === 'custom' && this.reservationsCustomDate) {
          const customDate = new Date(this.reservationsCustomDate);
          customDate.setHours(0, 0, 0, 0);
          return reservationDate >= customDate;
        }

        return true;
      });

      return items.sort(
        (a, b) =>
          new Date(String(a['entrada'] || '')).getTime() -
          new Date(String(b['entrada'] || '')).getTime()
      );
    }

    if (sectionId === 'faqs') {
      return items.sort(
        (a, b) => new Date(String(b['fecha'] || '')).getTime() - new Date(String(a['fecha'] || '')).getTime()
      );
    }

    return items;
  }

  setServicesFilter(filter: string): void {
    this.servicesFilter = filter;
    this.cancelEdit();
  }

  setMenusFilter(filter: string): void {
    this.menusFilter = filter;
    this.cancelEdit();
  }

  setReservationsFilter(filter: 'proximas' | 'todas'): void {
    this.reservationsFilter = filter;
    this.reservationsCustomDate = '';
    this.cancelEdit();
  }

  setReservationsCustomDate(rawDate: string): void {
    this.reservationsCustomDate = rawDate;

    if (rawDate) {
      this.reservationsFilter = 'custom';
    }

    this.cancelEdit();
  }

  formatFieldValue(field: AdminField, row: AdminItem): string {
    const rawValue = row[field.name];

    if (rawValue === null || rawValue === undefined) {
      return '';
    }

    if (field.type === 'date') {
      const asString = String(rawValue);
      const parts = asString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }

      return asString;
    }

    if (field.name === 'precio') {
      const numeric = Number(rawValue);
      if (Number.isFinite(numeric)) {
        return `${numeric.toFixed(2)} €`;
      }
    }

    return String(rawValue);
  }

  isImageField(field: AdminField): boolean {
    return field.name === 'imagen';
  }

  openImageModal(src: string): void {
    if (!src) {
      return;
    }

    this.modalImageSrc = src;
  }

  closeImageModal(): void {
    this.modalImageSrc = '';
  }

  getImageValue(row: AdminItem, fieldName: string): string {
    return String(row[fieldName] || '');
  }

  getRealIndex(sectionId: string, row: AdminItem): number {
    const items = this.db[sectionId] || [];
    return items.indexOf(row);
  }

  isEditingRow(sectionId: string, row: AdminItem): boolean {
    const rowIndex = this.getRealIndex(sectionId, row);
    return this.editingSectionId === sectionId && this.editingRealIndex === rowIndex;
  }

  startEdit(section: AdminSection, row: AdminItem): void {
    const realIndex = this.getRealIndex(section.id, row);

    if (realIndex < 0) {
      return;
    }

    this.editingSectionId = section.id;
    this.editingRealIndex = realIndex;
    this.editValues = {};

    section.fields.forEach((field) => {
      this.editValues[field.name] = String(this.db[section.id][realIndex]?.[field.name] || '');
    });

    this.editFileBase64 = '';
    this.editFileLabel = 'CAMBIAR IMAGEN';
  }

  cancelEdit(): void {
    this.editingSectionId = null;
    this.editingRealIndex = -1;
    this.editValues = {};
    this.editFileBase64 = '';
    this.editFileLabel = 'CAMBIAR IMAGEN';
  }

  async onEditFileChange(event: Event, fieldName: string): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.editFileLabel = file.name;

    if (fieldName === 'imagen') {
      this.editFileBase64 = await this.convertFileToBase64(file);
    }
  }

  async saveEdit(section: AdminSection): Promise<void> {
    if (this.editingSectionId !== section.id || this.editingRealIndex < 0) {
      return;
    }

    if (!window.confirm('¿Guardar cambios?')) {
      return;
    }

    const db = this.adminDataService.getDb();
    const items = db[section.id] || [];
    const current = items[this.editingRealIndex];

    if (!current) {
      return;
    }

    const next: AdminItem = { ...current };
    section.fields.forEach((field) => {
      next[field.name] = this.editValues[field.name] || '';
    });

    if (this.editFileBase64) {
      next['imagen'] = this.editFileBase64;
    }

    items[this.editingRealIndex] = next;
    db[section.id] = items;
    this.adminDataService.saveDb(db);

    this.db = this.adminDataService.getDb();
    this.cancelEdit();
  }

  deleteFilteredItem(sectionId: string, row: AdminItem): void {
    if (!window.confirm('¿Estás seguro de que quieres borrar esto?')) {
      return;
    }

    if (sectionId === 'reservations' && !window.confirm('ÚLTIMO AVISO: Se borrará permanentemente.')) {
      return;
    }

    const realIndex = this.getRealIndex(sectionId, row);
    if (realIndex < 0) {
      return;
    }

    this.adminDataService.deleteItem(sectionId, realIndex);
    this.db = this.adminDataService.getDb();

    if (this.editingSectionId === sectionId && this.editingRealIndex === realIndex) {
      this.cancelEdit();
    }
  }

  toggleForm(sectionId: string): void {
    this.formsOpenBySection[sectionId] = !this.formsOpenBySection[sectionId];

    if (sectionId === 'reservations' && this.formsOpenBySection[sectionId]) {
      this.resetBookingWidget();
    }
  }

  isFormOpen(sectionId: string): boolean {
    return !!this.formsOpenBySection[sectionId];
  }

  getToggleText(section: AdminSection): string {
    if (this.isFormOpen(section.id)) {
      return '- Cerrar Formulario';
    }

    return `+ Añadir ${section.title}`;
  }

  getNewValue(sectionId: string, fieldName: string): string {
    this.ensureSectionStateById(sectionId);
    return this.newItemValues[sectionId][fieldName] || '';
  }

  setNewValue(sectionId: string, fieldName: string, value: string): void {
    this.ensureSectionStateById(sectionId);
    this.newItemValues[sectionId][fieldName] = value;
  }

  async onAddFileChange(event: Event, sectionId: string, fieldName: string): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const base64 = await this.convertFileToBase64(file);

    this.ensureSectionStateById(sectionId);
    this.newItemValues[sectionId][fieldName] = base64;
    this.fileLabels[sectionId][fieldName] = file.name;
  }

  getFileLabel(sectionId: string, fieldName: string): string {
    this.ensureSectionStateById(sectionId);
    return this.fileLabels[sectionId][fieldName] || 'SUBIR FOTO';
  }

  async submitNewItem(section: AdminSection): Promise<void> {
    if (!window.confirm('¿Añadir?')) {
      return;
    }

    const values = this.newItemValues[section.id] || {};
    const item: Record<string, string> = {};

    section.fields.forEach((field) => {
      item[field.name] = values[field.name] || '';
    });

    this.adminDataService.addItem(section.id, item);
    this.db = this.adminDataService.getDb();
    this.resetSectionForm(section);
  }

  private ensureSectionState(section: AdminSection): void {
    this.ensureSectionStateById(section.id);

    if (!Object.prototype.hasOwnProperty.call(this.formsOpenBySection, section.id)) {
      this.formsOpenBySection[section.id] = false;
    }

    if (!this.newItemValues[section.id]['tipo'] && section.id === 'services') {
      this.newItemValues[section.id]['tipo'] = 'bienestar';
    }

    if (!this.newItemValues[section.id]['categoria'] && section.id === 'menus') {
      this.newItemValues[section.id]['categoria'] = 'entrantes';
    }
  }

  private ensureSectionStateById(sectionId: string): void {
    if (!this.newItemValues[sectionId]) {
      this.newItemValues[sectionId] = {};
    }

    if (!this.fileLabels[sectionId]) {
      this.fileLabels[sectionId] = {};
    }
  }

  private resetSectionForm(section: AdminSection): void {
    this.newItemValues[section.id] = {};
    this.fileLabels[section.id] = {};

    if (section.id === 'services') {
      this.newItemValues[section.id]['tipo'] = 'bienestar';
    }

    if (section.id === 'menus') {
      this.newItemValues[section.id]['categoria'] = 'entrantes';
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (error) => reject(error);
    });
  }

  resetBookingWidget(): void {
    const availability = this.bookingConfig?.availability;
    this.bookingSearch.checkin = availability?.defaultCheckin || '';
    this.bookingSearch.checkout = availability?.defaultCheckout || '';
    this.bookingSearch.guests = Number(availability?.defaultGuests || 1);
    this.bookingSearch.includeFamilySuite = false;

    this.bookingCandidates = [];
    this.selectedCandidateIndexes = new Set<number>();
    this.currentCapacity = 0;
    this.requestedGuests = 0;
    this.totalNights = 0;
    this.bookingStatusMessage = '';
    this.bookingStatusType = 'default';
    this.showBookingRoomList = false;
    this.showBookingCheckout = false;
    this.bookingFinal = { name: '', lastName: '', email: '' };
  }

  searchBookingRooms(): void {
    const checkin = new Date(this.bookingSearch.checkin);
    const checkout = new Date(this.bookingSearch.checkout);

    if (checkin >= checkout) {
      window.alert('La fecha de salida debe ser posterior a la de entrada.');
      return;
    }

    this.totalNights = Math.ceil(Math.abs(checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    this.requestedGuests = Number(this.bookingSearch.guests || 1);

    let availableRooms = [...(this.db['rooms'] || [])];
    if (!this.bookingSearch.includeFamilySuite) {
      availableRooms = availableRooms.filter((room) => String(room['nombre'] || '') !== 'Habitación Familiar');
    }

    this.bookingCandidates = availableRooms;
    this.selectedCandidateIndexes = new Set<number>();
    this.currentCapacity = 0;
    this.showBookingRoomList = true;
    this.showBookingCheckout = false;
    this.bookingStatusType = 'default';
    this.bookingStatusMessage = `Selecciona habitaciones para ${this.requestedGuests} huéspedes.`;
  }

  addBookingRoom(index: number): void {
    if (this.selectedCandidateIndexes.has(index) || this.currentCapacity >= this.requestedGuests) {
      return;
    }

    this.selectedCandidateIndexes.add(index);

    const room = this.bookingCandidates[index];
    const capacity = Number(room?.['huespedes'] || room?.['guests'] || room?.['maxGuests'] || 0);
    this.currentCapacity += Number.isFinite(capacity) ? capacity : 0;

    if (this.currentCapacity < this.requestedGuests) {
      this.bookingStatusType = 'warning';
      this.bookingStatusMessage = `Faltan ${this.requestedGuests - this.currentCapacity} plazas.`;
      return;
    }

    this.bookingStatusType = 'success';
    this.bookingStatusMessage = '¡Capacidad cubierta!';
    this.showBookingCheckout = true;
  }

  isBookingRoomDisabled(index: number): boolean {
    return this.selectedCandidateIndexes.has(index) || this.currentCapacity >= this.requestedGuests;
  }

  getSelectedBookingRooms(): AdminItem[] {
    return Array.from(this.selectedCandidateIndexes)
      .map((index) => this.bookingCandidates[index])
      .filter((room): room is AdminItem => !!room);
  }

  getBookingSummaryRooms(): string {
    return this.getSelectedBookingRooms()
      .map((room) => String(room['nombre'] || room['title'] || ''))
      .join(', ');
  }

  getBookingTotalPrice(): number {
    return this.getSelectedBookingRooms().reduce((total, room) => {
      const nightly = Number(room['precio'] || room['price'] || 0);
      return total + nightly * this.totalNights;
    }, 0);
  }

  confirmAdminReservation(): void {
    const fullName = `${this.bookingFinal.name} ${this.bookingFinal.lastName}`.trim();

    if (!fullName || !this.bookingFinal.email) {
      return;
    }

    const selectedRooms = this.getSelectedBookingRooms();
    if (selectedRooms.length === 0) {
      return;
    }

    const newReservation: Record<string, string | number> = {
      cliente: fullName,
      email: this.bookingFinal.email,
      habitacion: selectedRooms.map((room) => String(room['nombre'] || room['title'] || '')).join(', '),
      entrada: this.bookingSearch.checkin,
      salida: this.bookingSearch.checkout,
      huespedes: this.requestedGuests
    };

    const db = this.adminDataService.getDb();
    if (!Array.isArray(db['reservations'])) {
      db['reservations'] = [];
    }

    db['reservations'].push(newReservation);
    this.adminDataService.saveDb(db);
    this.db = this.adminDataService.getDb();

    window.alert('¡Reserva añadida con éxito!');
    this.resetBookingWidget();
  }

  getRoomImage(room: AdminItem): string {
    return String(room['imagen'] || room['img'] || '');
  }

  getRoomName(room: AdminItem): string {
    return String(room['nombre'] || room['title'] || 'Habitación');
  }

  getRoomCapacity(room: AdminItem): number {
    return Number(room['huespedes'] || room['guests'] || room['maxGuests'] || 0);
  }

  getRoomPrice(room: AdminItem): number {
    return Number(room['precio'] || room['price'] || 0);
  }

  isLongTextField(fieldName: string): boolean {
    return fieldName === 'descripcion' || fieldName === 'duda';
  }

  isWideEditField(fieldName: string): boolean {
    return fieldName === 'descripcion' || fieldName === 'cliente' || fieldName === 'nombre';
  }
}
