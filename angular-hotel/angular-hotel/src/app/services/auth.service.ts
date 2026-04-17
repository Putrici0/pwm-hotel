import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as firebaseUpdatePassword
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';

interface UserAccessDocument {
  email: string;
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user?.email) {
        this.clearLocalSession();
        return;
      }

      void this.syncSessionFromUser(user);
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const credentials = await signInWithEmailAndPassword(this.auth, normalizedEmail, password);
      await this.syncSessionFromUser(credentials.user);
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
      const credentials = await createUserWithEmailAndPassword(this.auth, normalizedEmail, password);
      await this.ensureUserAccessDocument(credentials.user.uid, normalizedEmail, false);
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

      if (code === 'permission-denied') {
        return { ok: false, message: 'Firestore denego permisos al crear users/{uid}. Revisa las reglas.' };
      }

      if (code === 'unavailable') {
        return { ok: false, message: 'Firestore no disponible temporalmente.' };
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

  private async syncSessionFromUser(user: User): Promise<void> {
    const email = user.email || '';
    let role: 'admin' | 'user' = 'user';

    try {
      const accessDoc = await this.ensureUserAccessDocument(user.uid, email, false);
      role = accessDoc.isAdmin ? 'admin' : 'user';
    } catch {
      role = 'user';
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedUserEmail', email);
    localStorage.setItem('userRole', role);
  }

  private async ensureUserAccessDocument(
    uid: string,
    email: string,
    defaultIsAdmin: boolean
  ): Promise<UserAccessDocument> {
    const normalizedEmail = email.toLowerCase();
    const userAccessRef = doc(this.firestore, 'users', uid);
    const userAccessSnapshot = await getDoc(userAccessRef);

    if (!userAccessSnapshot.exists()) {
      await setDoc(userAccessRef, {
        email: normalizedEmail,
        isAdmin: defaultIsAdmin,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        email: normalizedEmail,
        isAdmin: defaultIsAdmin
      };
    }

    const userAccessData = userAccessSnapshot.data() as Partial<UserAccessDocument>;
    const isAdmin = userAccessData.isAdmin === true;
    const storedEmail = typeof userAccessData.email === 'string' ? userAccessData.email.toLowerCase() : normalizedEmail;

    if (storedEmail !== normalizedEmail) {
      await setDoc(
        userAccessRef,
        {
          email: normalizedEmail,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }

    return {
      email: storedEmail !== normalizedEmail ? normalizedEmail : storedEmail,
      isAdmin
    };
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
