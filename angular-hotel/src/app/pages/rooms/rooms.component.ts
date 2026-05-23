import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { IonCard, IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDataService } from '../../services/admin-data.service';

interface RoomSection {
  title: string;
  description: string;
  imageGradient: string;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, IonContent, IonCard],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent {
  private readonly adminDataService = inject(AdminDataService);

  readonly rooms$ = this.adminDataService.watchSection('rooms').pipe(
    map((rooms) =>
      rooms.map((room) => ({
        title: String(room['nombre'] || ''),
        description: String(room['descripcion'] || ''),
        imageGradient: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(${String(room['imagen'] || '')}) center/cover no-repeat`
      }))
    )
  );

  constructor() {
    void this.adminDataService.ensureInitialized();
  }
}
