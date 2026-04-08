import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SiteDataService } from './site-data.service';

interface AuthUser {
  email: string;
  password: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly siteDataService = inject(SiteDataService);

  async login(email: string, password: string): Promise<boolean> {
    const user = await this.authenticate(email, password);
    if (!user) {
      return false;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedUserEmail', email);
    localStorage.setItem('userRole', user.role);
    return true;
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedUserEmail');
    localStorage.removeItem('userRole');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && localStorage.getItem('userRole') === 'admin';
  }

  getLoggedUserEmail(): string {
    return localStorage.getItem('loggedUserEmail') || '';
  }

  async register(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    const allUsers = await this.getAllUsers();
    if (allUsers.some((user) => user.email === email)) {
      return { ok: false, message: 'Ese correo ya esta registrado.' };
    }

    const localUsers = this.getLocalRegisteredUsers();
    localUsers.push({ email, password, role: 'user' });
    localStorage.setItem('registeredUsers', JSON.stringify(localUsers));
    return { ok: true };
  }

  async emailExists(email: string): Promise<boolean> {
    const allUsers = await this.getAllUsers();
    return allUsers.some((user) => user.email === email);
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const localUsers = this.getLocalRegisteredUsers();
    const existingLocal = localUsers.find((user) => user.email === email);
    if (existingLocal) {
      existingLocal.password = newPassword;
      localStorage.setItem('registeredUsers', JSON.stringify(localUsers));
      return;
    }

    const overrides = this.getPasswordOverrides();
    overrides[email] = newPassword;
    localStorage.setItem('passwordOverrides', JSON.stringify(overrides));
  }

  private async authenticate(email: string, password: string): Promise<AuthUser | null> {
    const users = await this.getAllUsers();
    const passwordOverrides = this.getPasswordOverrides();

    return (
      users.find((user) => {
        const expectedPassword =
          Object.prototype.hasOwnProperty.call(passwordOverrides, user.email)
            ? passwordOverrides[user.email]
            : user.password;
        return user.email === email && expectedPassword === password;
      }) || null
    );
  }

  private async getAllUsers(): Promise<AuthUser[]> {
    try {
      const data = await firstValueFrom(this.siteDataService.getAllData());
      const baseUsers = Array.isArray((data as { users?: AuthUser[] }).users)
        ? ((data as { users: AuthUser[] }).users ?? [])
        : [];
      return [...baseUsers, ...this.getLocalRegisteredUsers()];
    } catch {
      return this.getLocalRegisteredUsers();
    }
  }

  private getLocalRegisteredUsers(): AuthUser[] {
    try {
      const parsed = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      return Array.isArray(parsed) ? (parsed as AuthUser[]) : [];
    } catch {
      return [];
    }
  }

  private getPasswordOverrides(): Record<string, string> {
    try {
      const parsed = JSON.parse(localStorage.getItem('passwordOverrides') || '{}');
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
    } catch {
      return {};
    }
  }
}
