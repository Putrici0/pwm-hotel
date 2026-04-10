import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TextImageSectionComponent } from '../../components/text-image-section/text-image-section.component';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, TextImageSectionComponent],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css'
})
export class RestaurantComponent {
  private readonly siteDataService = inject(SiteDataService);
  readonly restaurantData$ = this.siteDataService.getSection<{
    dailyMenu: { title: string; description: string; imageGradient: string; price?: string };
    fixedMenu: { title: string };
    starters: { title: string; items: Array<{ name: string; price: string; imageGradient: string }> };
    firstDishes: { title: string; items: Array<{ name: string; price: string; imageGradient: string }> };
    secondDishes: { title: string; items: Array<{ name: string; price: string; imageGradient: string }> };
    desserts: { title: string; items: Array<{ name: string; price: string; imageGradient: string }> };
  }>('restaurant');
}
