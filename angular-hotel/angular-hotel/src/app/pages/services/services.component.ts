import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TextImageSectionComponent } from '../../components/text-image-section/text-image-section.component';
import { TitleSubtitleComponent } from '../../components/title-subtitle/title-subtitle.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    TitleSubtitleComponent,
    TextImageSectionComponent
  ],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  private readonly siteDataService = inject(SiteDataService);
  readonly servicesData$ = this.siteDataService.getSection<{
    intro: { title: string; description: string };
    services: Array<{ title: string; description: string; imageGradient: string; imageLink?: string }>;
  }>('services');
}
