import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonToolbar
} from '@ionic/angular/standalone';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  menuOpen = false;
  servicesDropdownOpen = false;
  accountDropdownOpen = false;
  flashMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.consumeFlashMessage();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.consumeFlashMessage());
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.servicesDropdownOpen = false;
    this.accountDropdownOpen = false;
  }

  toggleServicesDropdown(event?: Event): void {
    event?.preventDefault();
    this.servicesDropdownOpen = !this.servicesDropdownOpen;
  }

  toggleAccountDropdown(event?: Event): void {
    event?.preventDefault();
    this.accountDropdownOpen = !this.accountDropdownOpen;
  }

  get showLogout(): boolean {
    return this.authService.isLoggedIn();
  }

  get accountRoute(): string {
    return this.authService.isLoggedIn() ? '/account' : '/login';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.closeMenu();
    this.router.navigateByUrl('/login');
  }

  closeFlash(): void {
    this.flashMessage = '';
  }

  private consumeFlashMessage(): void {
    const flash = sessionStorage.getItem('app_flash_success') || '';
    if (!flash) {
      return;
    }
    this.flashMessage = flash;
    sessionStorage.removeItem('app_flash_success');
    setTimeout(() => {
      this.flashMessage = '';
    }, 3500);
  }
}
