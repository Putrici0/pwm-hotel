import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TextImageSectionComponent } from '../../components/text-image-section/text-image-section.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, TextImageSectionComponent],
  templateUrl: './rooms.component.html'
})
export class RoomsComponent {
  private readonly siteDataService = inject(SiteDataService);
  readonly roomsData$ = this.siteDataService.getSection<{ rooms: Array<Record<string, string>> }>('rooms');
}
