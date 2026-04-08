import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TitleSubtitleComponent } from '../../components/title-subtitle/title-subtitle.component';
import { AuthService } from '../../services/auth.service';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, TitleSubtitleComponent],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {
  private readonly siteDataService = inject(SiteDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  accountData: any = null;
  reservations: Array<{ id: string; checkin: string; checkout: string }> = [];

  ngOnInit(): void {
    this.siteDataService.getSection<any>('account').subscribe((data) => {
      this.accountData = data;
      const loggedEmail = this.authService.getLoggedUserEmail();
      const user = Array.isArray(data?.users) ? data.users.find((u: any) => u.email === loggedEmail) : null;
      this.reservations =
        user && Array.isArray(user.reservations) && user.reservations.length > 0
          ? user.reservations
          : [{ id: 'Sin reservas', checkin: '-', checkout: '-' }];
    });
  }

  async goToChangePassword(): Promise<void> {
    await this.router.navigateByUrl('/change-password');
  }
}
