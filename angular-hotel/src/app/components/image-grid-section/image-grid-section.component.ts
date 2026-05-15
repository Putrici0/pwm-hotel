import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonText } from '@ionic/angular/standalone';

interface ImageGridItem {
  title: string;
  description: string;
  imageGradient: string;
  imageLink?: string;
}

interface ImageGridSection {
  title: string;
  items: ImageGridItem[];
}

@Component({
  selector: 'app-image-grid-section',
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText],
  templateUrl: './image-grid-section.component.html',
  styleUrl: './image-grid-section.component.css'
})
export class ImageGridSectionComponent {
  @Input({ required: true }) sectionData!: ImageGridSection;
  constructor(private readonly router: Router) {}

  goTo(link?: string): void {
    if (!link) {
      return;
    }

    if (/^https?:\/\//.test(link)) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }

    const normalized = link.replace('.html', '');
    this.router.navigateByUrl(normalized.startsWith('/') ? normalized : `/${normalized}`);
  }
}
