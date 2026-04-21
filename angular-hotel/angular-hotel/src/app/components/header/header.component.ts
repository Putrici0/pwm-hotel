import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  menuOpen = false;
  servicesDropdownOpen = false;
  accountDropdownOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

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

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.closeMenu();
    this.router.navigateByUrl('/login');
  }
}
