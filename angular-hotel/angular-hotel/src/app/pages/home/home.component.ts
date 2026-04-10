import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { TextImageSectionComponent } from '../../components/text-image-section/text-image-section.component';
import { ImageGridSectionComponent } from '../../components/image-grid-section/image-grid-section.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    TextImageSectionComponent,
    ImageGridSectionComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private readonly siteDataService = inject(SiteDataService);
  readonly homeData$ = this.siteDataService.getSection<{
    intro: { title: string; description: string; imageGradient: string; imageLink?: string };
    islandInfo: { title: string; description: string; imageGradient: string; imageLink?: string };
    environment: {
      title: string;
      items: Array<{ title: string; description: string; imageGradient: string; imageLink?: string }>;
    };
    rooms: { title: string; description: string; imageGradient: string; imageLink?: string };
    services: {
      title: string;
      items: Array<{ title: string; description: string; imageGradient: string; imageLink?: string }>;
    };
    location: { title: string; description: string; imageGradient: string; imageLink?: string };
  }>('index');
}
