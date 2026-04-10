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
  db: Record<string, Array<Record<string, string>>> = {};
  formValues: Record<string, Record<string, string>> = {};

  async ngOnInit(): Promise<void> {
    await this.adminDataService.ensureInitialized();
    this.siteDataService.getSection<any>('admin').subscribe((adminConfig) => {
      this.adminTitle = adminConfig.title;
      this.sections = adminConfig.sections || [];
      this.db = this.adminDataService.getDb();
      this.sections.forEach((section) => {
        if (!this.formValues[section.id]) {
          this.formValues[section.id] = {};
        }
      });
    });
  }

  getRows(sectionId: string): Array<Record<string, string>> {
    return this.db[sectionId] || [];
  }

  deleteItem(sectionId: string, index: number): void {
    this.adminDataService.deleteItem(sectionId, index);
    this.db = this.adminDataService.getDb();
  }

  async onFileChange(event: Event, sectionId: string, fieldName: string): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const base64 = await this.convertFileToBase64(file);
    this.formValues[sectionId][fieldName] = base64;
  }

  submit(section: AdminSection): void {
    const values = this.formValues[section.id] || {};
    const item: Record<string, string> = {};
    section.fields.forEach((field) => {
      item[field.name] = values[field.name] || '';
    });

    this.adminDataService.addItem(section.id, item);
    this.db = this.adminDataService.getDb();
    this.formValues[section.id] = {};
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (error) => reject(error);
    });
  }
}
