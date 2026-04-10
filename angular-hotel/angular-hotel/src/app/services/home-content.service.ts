import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HomePageData } from '../models/home.model';

@Injectable({
  providedIn: 'root'
})
export class HomeContentService {
  getHomePageData(): Observable<HomePageData> {
    // Fuente local temporal. En el futuro este servicio se puede cambiar por Firebase.
    return of(HOME_PAGE_DATA);
  }
}

const HOME_PAGE_DATA: HomePageData = {
  intro: {
    title: 'Isla Dorada Hotel',
    description:
      'Un hotel frente al mar en Gran Canaria con estancias confortables, servicios premium y una experiencia pensada para desconectar.',
    imageGradient:
      'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(/img/index/1.webp) center/cover no-repeat'
  },
  islandInfo: {
    title: 'Gran Canaria, la isla del hotel',
    description:
      'Gran Canaria combina playa, naturaleza y cultura en un mismo destino. Puedes disfrutar de dunas, rutas de montana, pueblos con encanto y una oferta gastronomica muy variada durante todo el ano.',
    imageGradient:
      'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(/img/index/2.jpg) center/cover no-repeat'
  },
  environment: {
    title: 'Compromiso ambiental del hotel',
    items: [
      {
        title: 'Eficiencia energetica',
        description:
          'Uso de iluminacion LED y sistemas de climatizacion optimizados para reducir el consumo.',
        imageGradient:
          'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/img/index/3.png) center/cover no-repeat'
      },
      {
        title: 'Consumo responsable de agua',
        description:
          'Programa de reutilizacion de toallas y control inteligente de caudal en habitaciones y zonas comunes.',
        imageGradient:
          'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/img/index/4.jpg) center/cover no-repeat'
      },
      {
        title: 'Gestion de residuos',
        description:
          'Separacion selectiva, reduccion de plasticos de un solo uso y colaboracion con proveedores locales.',
        imageGradient:
          'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(/img/index/5.jpg) center/cover no-repeat'
      }
    ]
  },
  rooms: {
    title: 'Habitaciones para cada tipo de viaje',
    description:
      'Desde habitaciones acogedoras para escapadas cortas hasta suites premium con vistas al oceano, todas equipadas para garantizar descanso y comodidad.',
    imageGradient:
      'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(/img/index/6.jpg) center/cover no-repeat',
    imageLink: 'rooms.html'
  },
  services: {
    title: 'Servicios destacados del hotel',
    items: [
      {
        title: 'Wellness',
        description:
          'Gimnasio, piscina y spa para mantener tu rutina de bienestar durante la estancia.',
        imageGradient:
          'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/img/index/7.jpg) center/cover no-repeat',
        imageLink: 'wellness-facilities.html'
      },
      {
        title: 'Restauracion',
        description:
          'Propuesta gastronomica diaria con cocina local e internacional elaborada con producto fresco.',
        imageGradient:
          'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/img/index/8.webp) center/cover no-repeat',
        imageLink: 'restaurant.html'
      },
      {
        title: 'Actividades',
        description:
          'Experiencias dentro y fuera del hotel: rutas, ocio familiar y planes personalizados.',
        imageGradient:
          'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/img/index/9.jpg) center/cover no-repeat',
        imageLink: 'activities.html'
      }
    ]
  },
  location: {
    title: 'Localizacion del hotel',
    description:
      'Isla Dorada Hotel se encuentra en el exclusivo Paseo de Meloneras 37, Maspalomas, en la costa sur de Gran Canaria, a pocos minutos de la playa y del Faro.',
    imageGradient:
      'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(/img/index/1.jpg) center/cover no-repeat',
    imageLink: 'https://www.google.com/maps/dir/?api=1&destination=Paseo+de+Meloneras+37,+Maspalomas'
  }
};
