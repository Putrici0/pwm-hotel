import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as firebaseUpdatePassword
} from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { SiteDataService } from './site-data.service';

interface AuthRoleUser {
  email: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly siteDataService = inject(SiteDataService);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user?.email) {
        this.clearLocalSession();
        return;
      }

      void this.persistLocalSession(user.email);
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const credentials = await signInWithEmailAndPassword(this.auth, normalizedEmail, password);
      const resolvedEmail = credentials.user.email || normalizedEmail;
      await this.persistLocalSession(resolvedEmail);
      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    void signOut(this.auth);
    this.clearLocalSession();
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser || localStorage.getItem('isLoggedIn') === 'true';
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && localStorage.getItem('userRole') === 'admin';
  }

  getLoggedUserEmail(): string {
    return this.auth.currentUser?.email || localStorage.getItem('loggedUserEmail') || '';
  }

  async register(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await createUserWithEmailAndPassword(this.auth, normalizedEmail, password);
      await signOut(this.auth);
      this.clearLocalSession();
      return { ok: true };
    } catch (error: unknown) {
      const code = this.extractErrorCode(error);
      if (code === 'auth/email-already-in-use') {
        return { ok: false, message: 'Ese correo ya esta registrado.' };
      }

      if (code === 'auth/invalid-email') {
        return { ok: false, message: 'El correo electronico no es valido.' };
      }

      if (code === 'auth/weak-password') {
        return { ok: false, message: 'La contrasena es demasiado debil.' };
      }

      return { ok: false, message: 'No se pudo registrar el usuario.' };
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, normalizedEmail);
      return signInMethods.length > 0;
    } catch {
      return false;
    }
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const currentUser = this.auth.currentUser;

    if (currentUser?.email?.toLowerCase() === normalizedEmail) {
      await firebaseUpdatePassword(currentUser, newPassword);
      return;
    }

    await sendPasswordResetEmail(this.auth, normalizedEmail);
  }

  private async persistLocalSession(email: string): Promise<void> {
    const role = await this.getUserRoleByEmail(email);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedUserEmail', email);
    localStorage.setItem('userRole', role);
  }

  private async getUserRoleByEmail(email: string): Promise<'admin' | 'user'> {
    try {
      const usersDoc = await firstValueFrom(this.siteDataService.getSection<{users?: AuthRoleUser[]}>('users'));
      const users = Array.isArray(usersDoc?.users) ? usersDoc.users : [];
      const foundUser = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
      return foundUser?.role === 'admin' ? 'admin' : 'user';
    } catch {
      return 'user';
    }
  }

  private clearLocalSession(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedUserEmail');
    localStorage.removeItem('userRole');
  }

  private extractErrorCode(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
      return String((error as {code?: string}).code || '');
    }

    return '';
  }
}
