import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import BookingComponent from './pages/booking/booking.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { ServicesComponent } from './pages/services/services.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { WellnessFacilitiesComponent } from './pages/wellness-facilities/wellness-facilities.component';
import { ActivitiesComponent } from './pages/activities/activities.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { AccountComponent } from './pages/account/account.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LegalComponent } from './pages/legal/legal.component';
import { RestaurantComponent } from './pages/restaurant/restaurant.component';
import { DishDetailComponent } from './pages/dish-detail/dish-detail.component';
import { accountGuard, adminGuard } from './guards/auth.guards';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'booking', component: BookingComponent, canActivate: [accountGuard] },
  { path: 'rooms', component: RoomsComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'restaurant', component: RestaurantComponent },
  { path: 'restaurant/:id', component: DishDetailComponent },
  { path: 'menu', redirectTo: 'restaurant', pathMatch: 'full' },
  { path: 'dish-page/:id', redirectTo: 'restaurant/:id' },
  { path: 'favorites', component: FavoritesComponent, canActivate: [accountGuard] },
  { path: 'wellness-facilities', component: WellnessFacilitiesComponent },
  { path: 'activities', component: ActivitiesComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'legal', component: LegalComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'account', component: AccountComponent, canActivate: [accountGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
