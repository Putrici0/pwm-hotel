import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService } from '../../services/admin-data.service';

interface FacilityItem {
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-wellness-facilities',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './wellness-facilities.component.html',
  styleUrl: './wellness-facilities.component.css'
})
export class WellnessFacilitiesComponent {
  private readonly adminDataService = inject(AdminDataService);

  readonly facilities$ = this.adminDataService.watchSection('wellness').pipe(
    map((facilities) =>
      facilities.map((item) => ({
        title: String(item['nombre'] || ''),
        description: String(item['descripcion'] || ''),
        imageUrl: String(item['imagen'] || '')
      }))
    )
  );

  constructor() {
    void this.adminDataService.ensureInitialized();
  }
}
