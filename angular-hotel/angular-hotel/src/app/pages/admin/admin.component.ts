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
        { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
        { key: 'huespedes', label: 'Huespedes', type: 'number' },
        { key: 'precio', label: 'Precio', type: 'number' },
        { key: 'imagen', label: 'URL Imagen', type: 'text' }
      ]
    },
    {
      id: 'restaurant',
      label: 'Restauracion',
      fields: [
        { key: 'nombre', label: 'Nombre', type: 'text' },
        { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
        { key: 'categoria', label: 'Categoria', type: 'select', options: ['entrantes', 'primeros', 'segundos', 'postres'] },
        { key: 'imagen', label: 'URL Imagen', type: 'text' }
      ]
    },
    {
      id: 'activities',
      label: 'Actividades',
      fields: [
        { key: 'nombre', label: 'Nombre', type: 'text' },
        { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
        { key: 'duracion', label: 'Duracion', type: 'text' },
        { key: 'imagen', label: 'URL Imagen', type: 'text' }
      ]
    },
    {
      id: 'wellness',
      label: 'Bienestar',
      fields: [
        { key: 'nombre', label: 'Nombre', type: 'text' },
        { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
        { key: 'imagen', label: 'URL Imagen', type: 'text' }
      ]
    },
    {
      id: 'reservations',
      label: 'Reservas',
      fields: [
        { key: 'nombre', label: 'Nombre', type: 'text' },
        { key: 'apellidos', label: 'Apellidos', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'telefono', label: 'Telefono', type: 'text' },
        { key: 'dni', label: 'DNI / Pasaporte', type: 'text' },
        { key: 'habitacion', label: 'Habitacion', type: 'select', optionsFromSection: 'rooms', optionsFromKey: 'nombre' },
        { key: 'entrada', label: 'Entrada', type: 'date' },
        { key: 'salida', label: 'Salida', type: 'date' },
        { key: 'huespedes', label: 'Huespedes', type: 'number' }
      ]
    }
  ];

  currentSectionId: CrudSectionId = 'rooms';
  rowsBySection: Record<CrudSectionId, AdminItem[]> = {
    rooms: [],
    restaurant: [],
    activities: [],
    wellness: [],
    reservations: []
  };

  createForm: Record<string, string> = {};
  editForm: Record<string, string> = {};
  editingId = '';
  saving = false;
  statusMessage = '';
  statusType: 'success' | 'danger' = 'success';
  createErrorMessage = '';
  editErrorMessage = '';
  private activeSaveToken = 0;
  pendingDelete: AdminItem | null = null;
  pendingAction: 'create' | 'edit' | null = null;
  createValidationVisible = false;
  editValidationVisible = false;

  async ngOnInit(): Promise<void> {
    this.sections.forEach((section) => {
      this.adminDataService.watchSection(section.id).subscribe((rows) => {
        this.rowsBySection = {
          ...this.rowsBySection,
          [section.id]: rows
        };
        this.cdr.detectChanges();
      });
    });
    this.resetCreateForm();
    void this.adminDataService.ensureInitialized();
  }

  get currentSection(): AdminSection {
    return this.sections.find((s) => s.id === this.currentSectionId) || this.sections[0];
  }

  get currentRows(): AdminItem[] {
    return this.rowsBySection[this.currentSectionId] || [];
  }

  changeSection(sectionId: CrudSectionId): void {
    this.currentSectionId = sectionId;
    this.cancelEdit();
    this.resetCreateForm();
    this.statusMessage = '';
    this.createErrorMessage = '';
    this.editErrorMessage = '';
    this.createValidationVisible = false;
    this.editValidationVisible = false;
    this.pendingAction = null;
    this.pendingDelete = null;
  }

  startEdit(row: AdminItem): void {
    this.editValidationVisible = false;
    this.editingId = String(row['id'] || '');
    this.editForm = {};
    this.currentSection.fields.forEach((field) => {
      this.editForm[field.key] = String(row[field.key] ?? '');
    });
    this.ensureSelectDefaults(this.editForm);
  }

  cancelEdit(): void {
    this.activeSaveToken++;
    this.saving = false;
    this.editingId = '';
    this.editForm = {};
    this.editValidationVisible = false;
    this.editErrorMessage = '';
  }

  async saveEdit(): Promise<void> {
    if (!this.editingId) {
      return;
    }
    this.editValidationVisible = true;
    if (!this.validateForm('edit')) {
      return;
    }

    const token = ++this.activeSaveToken;
    this.saving = true;
    try {
      const nextItem = this.coerceValues(this.editForm);
      await this.withTimeout(
        this.adminDataService.updateItem(this.currentSection.id, this.editingId, nextItem),
        10000,
        'Tiempo de espera agotado al guardar'
      );
      if (token !== this.activeSaveToken) {
        return;
      }
      this.runUi(() => {
        this.rowsBySection = {
          ...this.rowsBySection,
          [this.currentSection.id]: this.rowsBySection[this.currentSection.id].map((row) =>
            String(row['id'] || '') === this.editingId ? { ...row, ...nextItem } : row
          )
        };
        this.cancelEdit();
        this.editErrorMessage = '';
        this.setStatus('success', 'Elemento actualizado correctamente.');
      });
    } catch (error) {
      if (token !== this.activeSaveToken) {
        return;
      }
      console.error(error);
      this.runUi(() => {
        this.editErrorMessage = 'No se pudo actualizar. Revisa permisos de Firestore.';
        this.setStatus('danger', 'No se pudo actualizar. Revisa permisos de Firestore.');
      });
    } finally {
      if (token === this.activeSaveToken) {
        this.runUi(() => {
          this.saving = false;
        });
      }
    }
  }

  async createItem(): Promise<void> {
    this.createValidationVisible = true;
    if (!this.validateForm('create')) {
      return;
    }
    this.saving = true;
    try {
      const nextItem = this.coerceValues(this.createForm);
      await this.withTimeout(
        this.adminDataService.addItem(this.currentSection.id, nextItem),
        10000,
        'Tiempo de espera agotado al crear'
      );
      this.runUi(() => {
        this.resetCreateForm();
        this.createErrorMessage = '';
        this.createValidationVisible = false;
        this.setStatus('success', 'Elemento creado correctamente.');
      });
    } catch (error) {
      console.error(error);
      this.runUi(() => {
        this.createErrorMessage = 'No se pudo crear. Revisa permisos de Firestore.';
        this.setStatus('danger', 'No se pudo crear. Revisa permisos de Firestore.');
      });
    } finally {
      this.runUi(() => {
        this.saving = false;
      });
    }
  }

  requestDelete(row: AdminItem): void {
    this.runUi(() => {
      this.pendingDelete = row;
    });
  }

  requestCreate(): void {
    this.createValidationVisible = true;
    if (!this.validateForm('create')) {
      return;
    }
    this.runUi(() => {
      this.pendingAction = 'create';
    });
  }

  requestSaveEdit(): void {
    if (!this.editingId) {
      return;
    }
    this.editValidationVisible = true;
    if (!this.validateForm('edit')) {
      return;
    }
    this.runUi(() => {
      this.pendingAction = 'edit';
    });
  }

  cancelDelete(): void {
    this.runUi(() => {
      this.pendingDelete = null;
    });
  }

  cancelAction(): void {
    this.runUi(() => {
      this.pendingAction = null;
    });
  }

  async confirmAction(): Promise<void> {
    const action = this.pendingAction;
    this.pendingAction = null;
    if (action === 'create') {
      await this.createItem();
      return;
    }
    if (action === 'edit') {
      await this.saveEdit();
    }
  }

  async confirmDelete(): Promise<void> {
    const row = this.pendingDelete;
    if (!row) {
      return;
    }

    const id = String(row['id'] || '');
    if (!id) {
      this.pendingDelete = null;
      return;
    }

    try {
      await this.withTimeout(
        this.adminDataService.deleteItemById(this.currentSection.id, id),
        10000,
        'Tiempo de espera agotado al borrar'
      );
      this.runUi(() => {
        this.rowsBySection = {
          ...this.rowsBySection,
          [this.currentSection.id]: this.rowsBySection[this.currentSection.id].filter(
            (item) => String(item['id'] || '') !== id
          )
        };
        this.pendingDelete = null;
        this.setStatus('success', 'Elemento eliminado correctamente.');
      });
    } catch (error) {
      console.error(error);
      this.runUi(() => this.setStatus('danger', 'No se pudo borrar. Revisa permisos de Firestore.'));
    }
  }

  isEditing(row: AdminItem): boolean {
    return String(row['id'] || '') === this.editingId;
  }

  getFieldString(row: AdminItem, key: string): string {
    return String(row[key] ?? '');
  }

  isCreateFieldInvalid(field: AdminField): boolean {
    if (!this.createValidationVisible) {
      return false;
    }
    return !this.hasValue(this.createForm[field.key]);
  }

  isEditFieldInvalid(field: AdminField): boolean {
    if (!this.editValidationVisible) {
      return false;
    }
    return !this.hasValue(this.editForm[field.key]);
  }

  private resetCreateForm(): void {
    this.createForm = {};
    this.currentSection.fields.forEach((field) => {
      this.createForm[field.key] = '';
    });
    this.ensureSelectDefaults(this.createForm);
  }

  getFieldOptions(field: AdminField): string[] {
    if (field.optionsFromSection && field.optionsFromKey) {
      const sourceRows = this.rowsBySection[field.optionsFromSection] || [];
      return sourceRows
        .map((row) => String(row[field.optionsFromKey || ''] || '').trim())
        .filter(Boolean);
    }
    return field.options || [];
  }

  private coerceValues(values: Record<string, string>): AdminItem {
    const output: AdminItem = {};
    this.currentSection.fields.forEach((field) => {
      const raw = String(values[field.key] || '').trim();
      if (field.type === 'number') {
        const numeric = Number(raw);
        output[field.key] = Number.isFinite(numeric) ? numeric : 0;
        return;
      }
      output[field.key] = raw;
    });
    return output;
  }

  private setStatus(type: 'success' | 'danger', message: string): void {
    this.statusType = type;
    this.statusMessage = message;
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private runUi(action: () => void): void {
    this.ngZone.run(action);
    this.cdr.detectChanges();
  }

  private ensureSelectDefaults(formTarget: Record<string, string>): void {
    this.currentSection.fields.forEach((field) => {
      if (field.type !== 'select') {
        return;
      }
      const options = this.getFieldOptions(field);
      const current = String(formTarget[field.key] || '');
      if (!options.includes(current)) {
        formTarget[field.key] = '';
      }
    });
  }

  private hasValue(value: string | undefined): boolean {
    return String(value || '').trim().length > 0;
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

    if (this.currentSection.id === 'reservations') {
      const checkin = String(formValues['entrada'] || '');
      const checkout = String(formValues['salida'] || '');
      const roomName = String(formValues['habitacion'] || '');
      const guests = Number(formValues['huespedes'] || 0);
      const room = (this.rowsBySection['rooms'] || []).find((item) => String(item['nombre'] || '') === roomName);
      const roomMaxGuests = Number(room?.['huespedes'] || 0);

      const checkinDate = new Date(checkin);
      const checkoutDate = new Date(checkout);
      if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime())) {
        const message = 'Las fechas de entrada y salida no son validas.';
        this.setStatus('danger', message);
        if (mode === 'create') {
          this.createErrorMessage = message;
        } else {
          this.editErrorMessage = message;
        }
        return false;
      }
      if (checkinDate >= checkoutDate) {
        const message = 'La fecha de entrada debe ser anterior a la fecha de salida.';
        this.setStatus('danger', message);
        if (mode === 'create') {
          this.createErrorMessage = message;
        } else {
          this.editErrorMessage = message;
        }
        return false;
      }

      if (!room || !Number.isFinite(roomMaxGuests) || roomMaxGuests <= 0) {
        const message = 'La habitacion seleccionada no es valida.';
        this.setStatus('danger', message);
        if (mode === 'create') {
          this.createErrorMessage = message;
        } else {
          this.editErrorMessage = message;
        }
        return false;
      }

      if (!Number.isFinite(guests) || guests <= 0) {
        const message = 'El numero de huespedes debe ser mayor que cero.';
        this.setStatus('danger', message);
        if (mode === 'create') {
          this.createErrorMessage = message;
        } else {
          this.editErrorMessage = message;
        }
        return false;
      }

      if (guests > roomMaxGuests) {
        const message = `La habitacion seleccionada permite como maximo ${roomMaxGuests} huespedes.`;
        this.setStatus('danger', message);
        if (mode === 'create') {
          this.createErrorMessage = message;
        } else {
          this.editErrorMessage = message;
        }
        return false;
      }
    }

    this.statusMessage = '';
    if (mode === 'create') {
      this.createErrorMessage = '';
    } else {
      this.editErrorMessage = '';
    }
    return true;
  }
}
