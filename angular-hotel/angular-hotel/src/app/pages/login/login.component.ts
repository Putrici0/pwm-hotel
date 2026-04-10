import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly siteDataService = inject(SiteDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginData$ = this.siteDataService.getSection<any>('login');

  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  async submit(): Promise<void> {
    this.errorMessage = '';
    const ok = await this.authService.login(this.email, this.password);
    if (!ok) {
      this.errorMessage = 'Credenciales incorrectas. Intentalo de nuevo.';
      return;
    }

    if (this.authService.isAdmin()) {
      await this.router.navigateByUrl('/admin');
      return;
    }

    await this.router.navigateByUrl('/account');
  }
}
