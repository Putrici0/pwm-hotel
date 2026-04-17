import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

interface Dish {
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css'
})
export class RestaurantComponent {
  readonly menuImage =
    'https://st4.depositphotos.com/12982378/30973/i/600/depositphotos_309733034-stock-photo-selective-focus-surprised-man-holding.jpg';

  readonly starters: Dish[] = [
    {
      title: 'Ensalada de tomate y burrata',
      description: 'Propuesta fresca y ligera con producto de temporada.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Croquetas caseras de jamón ibérico',
      description: 'Receta cremosa con sabor tradicional.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Crema suave de calabaza',
      description: 'Opción templada y equilibrada.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Tosta de aguacate y salmón',
      description: 'Combinación suave y actual.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    }
  ];

  readonly firstDishes: Dish[] = [
    {
      title: 'Risotto de setas y parmesano',
      description: 'Arroz meloso con perfil cremoso y sabor intenso.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Pasta fresca con pesto de albahaca',
      description: 'Plato aromático y ligero.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Arroz meloso de marisco',
      description: 'Propuesta marinera y sabrosa.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Sopa del chef',
      description: 'Elaboración variable según temporada.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    }
  ];

  readonly secondDishes: Dish[] = [
    {
      title: 'Lubina al horno con verduras',
      description: 'Pescado de sabor suave acompañado de verduras.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Solomillo de ternera con puré trufado',
      description: 'Opción de mayor intensidad y presentación cuidada.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Pollo de corral al limón',
      description: 'Plato equilibrado y de sabor limpio.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Hamburguesa premium de la casa',
      description: 'Alternativa informal con producto seleccionado.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    }
  ];

  readonly desserts: Dish[] = [
    {
      title: 'Tarta de queso horneada',
      description: 'Postre cremoso con acabado suave.',
      imageUrl:
        'https://st.depositphotos.com/1027198/4329/i/600/depositphotos_43297933-stock-photo-cake-and-berries.jpg'
    },
    {
      title: 'Mousse de chocolate negro',
      description: 'Textura ligera y sabor intenso.',
      imageUrl:
        'https://st4.depositphotos.com/1037197/31151/i/600/depositphotos_311512020-stock-photo-small-individual-mousse-cake.jpg'
    },
    {
      title: 'Fruta fresca de temporada',
      description: 'Opción ligera y refrescante.',
      imageUrl:
        'https://st2.depositphotos.com/1069055/6252/i/600/depositphotos_62520347-stock-photo-collection-with-different-fruits-and.jpg'
    },
    {
      title: 'Helado artesano',
      description: 'Selección de sabores con presentación sencilla.',
      imageUrl:
        'https://st3.depositphotos.com/1370849/15821/i/600/depositphotos_158216348-stock-photo-italian-ice-cream-artisanal-preparation.jpg'
    }
  ];
}
