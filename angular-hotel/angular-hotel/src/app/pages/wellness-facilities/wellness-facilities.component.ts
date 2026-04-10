import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TextImageSectionComponent } from '../../components/text-image-section/text-image-section.component';
import { TitleSubtitleComponent } from '../../components/title-subtitle/title-subtitle.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-wellness-facilities',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    TitleSubtitleComponent,
    TextImageSectionComponent
  ],
  templateUrl: './wellness-facilities.component.html',
  styleUrl: './wellness-facilities.component.css'
})
export class WellnessFacilitiesComponent {
  private readonly siteDataService = inject(SiteDataService);
  readonly wellnessData$ = this.siteDataService.getSection<{
    intro: { title: string; description: string };
    facilities: Array<{ title: string; description: string; imageGradient: string }>;
  }>('wellness-facilities');
}
