import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { IonButton, IonCard, IonContent, IonModal, IonText } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService } from '../../services/admin-data.service';

interface ActivityItem {
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
}

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, IonContent, IonText, IonCard, IonModal, IonButton],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.css'
})
export class ActivitiesComponent {
  private readonly adminDataService = inject(AdminDataService);

  // Variable para controlar la imagen ampliada
  selectedImageModal: string | null = null;

  readonly activities$ = this.adminDataService.watchSection('activities').pipe(
    map((activities) =>
      activities.map((activity) => ({
        title: String(activity['nombre'] || ''),
        description: String(activity['descripcion'] || ''),
        duration: String(activity['duracion'] || ''),
        imageUrl: String(activity['imagen'] || '')
      }))
    )
  );

  constructor() {
    void this.adminDataService.ensureInitialized();
  }

  // Funciones para el modal de la foto grande
  openImageModal(url: string): void {
    if (url) {
      this.selectedImageModal = url;
    }
  }

  closeImageModal(): void {
    this.selectedImageModal = null;
  }
}
