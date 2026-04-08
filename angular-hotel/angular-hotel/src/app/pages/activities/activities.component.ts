import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TextImageSectionComponent } from '../../components/text-image-section/text-image-section.component';
import { TitleSubtitleComponent } from '../../components/title-subtitle/title-subtitle.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    TitleSubtitleComponent,
    TextImageSectionComponent
  ],
  templateUrl: './activities.component.html'
})
export class ActivitiesComponent {
  private readonly siteDataService = inject(SiteDataService);
  readonly activitiesData$ = this.siteDataService.getSection<{
    intro: { title: string; description: string };
    activities: Array<{ title: string; description: string; imageGradient: string }>;
  }>('activities');
}
