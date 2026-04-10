import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TextImageSection } from '../../models/home.model';

@Component({
  selector: 'app-text-image-section',
  standalone: true,
  templateUrl: './text-image-section.component.html',
  styleUrl: './text-image-section.component.css'
})
export class TextImageSectionComponent {
  @Input({ required: true }) sectionData!: TextImageSection;
  @Input() sectionClass = 'text-image-vertical';
  @Input() imageFirst = false;

  constructor(private readonly router: Router) {}

  handleClick(): void {
    const link = this.sectionData.imageLink;
    if (!link) {
      return;
    }

    if (this.isExternal(link)) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }

    this.router.navigateByUrl(this.normalizeInternalLink(link));
  }

  private isExternal(link: string): boolean {
    return /^https?:\/\//.test(link);
  }

  private normalizeInternalLink(link: string): string {
    const normalized = link.replace('.html', '');
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }
}
