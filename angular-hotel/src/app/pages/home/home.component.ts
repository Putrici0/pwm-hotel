import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonCardTitle, IonContent, IonText } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface CardItem {
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    IonContent,
    IonText,
    IonButton,
    IonCard,
    IonCardTitle,
    IonCardContent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  introImage =
    'https://media.jet2.com/is/image/jet2/LPA_70514_Seaside_Palm_Beach_Hotel_0822_12?';

  islandImage =
    'https://www.espanafascinante.com/media/espanafascinante/images/2023/06/22/20230622081318425979.jpg';

  locationImage =
    'https://i.etsystatic.com/6481221/r/il/7b8821/2261914167/il_fullxfull.2261914167_b2vu.jpg';

  roomsImage =
    'https://api.fishhotels.com/api/sites/6bc7c722-5ff4-4aa8-92c6-714ba2ce0386/media-images/-xgb5370.jpg?cw=2000&ch=1125&cx=0&cy=104&s=xl&w=1200&h=675';

  services: CardItem[] = [
    {
      title: 'Wellness',
      description:
        'Espacios de relax, piscina y zonas pensadas para el bienestar durante toda la estancia.',
      imageUrl:
        'https://chandonrealestate.com/wp-content/uploads/2019/04/spa-murcia.jpg',
      link: '/wellness-facilities'
    },
    {
      title: 'Restauracion',
      description:
        'Cocina equilibrada, propuestas variadas y una experiencia gastronomica cuidada.',
      imageUrl:
        'https://www.hotelesdunas.com/data/webp/cropped_wf5tvvq-5c88c3b6e63255dfd18f08811fc3a216.webp',
      link: '/restaurant'
    },
    {
      title: 'Actividades',
      description:
        'Planes para descubrir la isla, desconectar y completar la experiencia mas alla del hotel.',
      imageUrl:
        'https://www.grancanaria.com/turismo/fileadmin/diseno2014/img/wellness/cabeceras_estaticas/calma.jpg',
      link: '/activities'
    }
  ];

  environmentItems: CardItem[] = [
    {
      title: 'Eficiencia energetica',
      description:
        'Trabajamos para optimizar el consumo energetico con criterios de sostenibilidad y mantenimiento responsable.',
      imageUrl:
        'https://asefapi.es/wp-content/uploads/2022/05/istockphoto-1311617386-170667a.jpg'
    },
    {
      title: 'Consumo responsable de agua',
      description:
        'Promovemos un uso racional del agua mediante habitos de ahorro y sistemas de control del consumo.',
      imageUrl:
        'https://www.sallo.es/wp-content/themes/theme_sallo/img-cont/header.jpg'
    },
    {
      title: 'Gestion de residuos',
      description:
        'Fomentamos la separacion y correcta gestion de residuos para reducir el impacto ambiental del alojamiento.',
      imageUrl:
        'https://medicinagaditana.es/wp-content/uploads/2019/06/medio-ambiente.jpg'
    }
  ];
}
