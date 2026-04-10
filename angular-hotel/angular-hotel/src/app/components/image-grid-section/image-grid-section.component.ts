import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ImageGridSection } from '../../models/home.model';

@Component({
  selector: 'app-image-grid-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-grid-section.component.html'
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
