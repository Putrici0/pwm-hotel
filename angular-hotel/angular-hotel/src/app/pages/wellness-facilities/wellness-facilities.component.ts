import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

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
  readonly facilities: FacilityItem[] = [
    {
      title: 'Gimnasio',
      description:
        'Espacio orientado al entrenamiento y mantenimiento de la rutina durante la estancia.',
      imageUrl:
        'https://st5.depositphotos.com/20397274/81073/i/600/depositphotos_810735234-stock-photo-german-word-aktien-word-written.jpg'
    },
    {
      title: 'Piscina',
      description:
        'Zona exterior pensada para el descanso y el disfrute en un ambiente relajado.',
      imageUrl:
        'https://st5.depositphotos.com/20397274/81073/i/600/depositphotos_810735234-stock-photo-german-word-aktien-word-written.jpg'
    },
    {
      title: 'Spa',
      description:
        'Área de bienestar dedicada a la relajación y al cuidado personal.',
      imageUrl:
        'https://st5.depositphotos.com/20397274/81073/i/600/depositphotos_810735234-stock-photo-german-word-aktien-word-written.jpg'
    }
  ];
}
