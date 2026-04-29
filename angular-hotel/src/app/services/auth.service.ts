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
import { BehaviorSubject, Observable } from 'rxjs'; // Importar BehaviorSubject y Observable

interface UserAccessDocument {
  email: string;
  isAdmin: boolean;
  nombre?: string;
  apellidos?: string;
  dni?: string;
  nacimiento?: string;
}

interface RegisterProfileInput {
  name: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private currentRole: 'admin' | 'user' | null = null;
  private roleSyncPromise: Promise<void> | null = null;

  // Nuevo BehaviorSubject para el email del usuario
  // Inicializamos con el email de localStorage o null si no hay
  private readonly _loggedUserEmail = new BehaviorSubject<string | null>(localStorage.getItem('loggedUserEmail') || null);
  readonly loggedUserEmail$: Observable<string | null> = this._loggedUserEmail.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user?.email) {
        this.currentRole = null;
        this.roleSyncPromise = null;
        this.clearLocalSession();
        this._loggedUserEmail.next(null); // Emitir null si no hay usuario
        return;
      }

      this.roleSyncPromise = this.syncSessionFromUser(user);
      this._loggedUserEmail.next(user.email); // Emitir el email del usuario
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const credentials = await signInWithEmailAndPassword(this.auth, normalizedEmail, password);
      await this.syncSessionFromUser(credentials.user);
      this._loggedUserEmail.next(credentials.user.email); // Emitir el email tras login
      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    void signOut(this.auth);
    this.currentRole = null;
    this.roleSyncPromise = null;
    this.clearLocalSession();
    this._loggedUserEmail.next(null); // Emitir null tras logout
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser || localStorage.getItem('isLoggedIn') === 'true';
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && this.currentRole === 'admin';
  }

  async isAdminAsync(): Promise<boolean> {
    await this.ensureRoleReady();
    return this.isAdmin();
  }

  getLoggedUserEmail(): string {
    return this.auth.currentUser?.email || localStorage.getItem('loggedUserEmail') || '';
  }

  getLoggedUserUid(): string {
    return this.auth.currentUser?.uid || localStorage.getItem('loggedUserUid') || '';
  }

  getLoggedUserDisplayName(): string {
    const nombre = localStorage.getItem('loggedUserNombre') || '';
    const apellidos = localStorage.getItem('loggedUserApellidos') || '';
    return `${nombre} ${apellidos}`.trim();
  }

  async register(
    email: string,
    password: string,
    profile: RegisterProfileInput
  ): Promise<{ ok: boolean; message?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const credentials = await createUserWithEmailAndPassword(this.auth, normalizedEmail, password);
      await this.ensureUserAccessDocument(credentials.user.uid, normalizedEmail, false, {
        nombre: profile.name.trim(),
        apellidos: profile.lastName.trim(),
        dni: '',
        nacimiento: ''
      });
      await signOut(this.auth);
      this.clearLocalSession();
      this._loggedUserEmail.next(null); // Asegurar que el email se limpia tras el registro y logout
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

  async waitForSessionReady(timeoutMs = 4000): Promise<void> {
    if (this.auth.currentUser || localStorage.getItem('loggedUserUid')) {
      return;
    }

    await new Promise<void>((resolve) => {
      let resolved = false;
      const timeoutId = window.setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsubscribe();
          resolve();
        }
      }, timeoutMs);

      const unsubscribe = onAuthStateChanged(this.auth, () => {
        if (resolved) {
          return;
        }
        resolved = true;
        window.clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      });
    });
  }

  private async syncSessionFromUser(user: User): Promise<void> {
    const email = user.email || '';
    let role: 'admin' | 'user';
    let nombre = '';
    let apellidos = '';

    try {
      const accessDoc = await this.ensureUserAccessDocument(user.uid, email, false);
      role = accessDoc.isAdmin ? 'admin' : 'user';
      nombre = String(accessDoc.nombre || '');
      apellidos = String(accessDoc.apellidos || '');
    } catch {
      role = 'user';
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedUserUid', user.uid);
    localStorage.setItem('loggedUserEmail', email);
    localStorage.setItem('loggedUserNombre', nombre);
    localStorage.setItem('loggedUserApellidos', apellidos);
    this.currentRole = role;
    this._loggedUserEmail.next(email); // Asegurar que el email se emite aquí también
  }

  private async ensureRoleReady(): Promise<void> {
    if (this.currentRole !== null) {
      return;
    }

    if (this.roleSyncPromise) {
      await this.roleSyncPromise;
      return;
    }

    if (this.auth.currentUser) {
      this.roleSyncPromise = this.syncSessionFromUser(this.auth.currentUser);
      await this.roleSyncPromise;
    }
  }

  private async ensureUserAccessDocument(
    uid: string,
    email: string,
    defaultIsAdmin: boolean,
    profile?: Partial<Pick<UserAccessDocument, 'nombre' | 'apellidos' | 'dni' | 'nacimiento'>>
  ): Promise<UserAccessDocument> {
    const normalizedEmail = email.toLowerCase();
    const userAccessRef = doc(this.firestore, 'users', uid);
    const userAccessSnapshot = await getDoc(userAccessRef);

    if (!userAccessSnapshot.exists()) {
      await setDoc(userAccessRef, {
        email: normalizedEmail,
        isAdmin: defaultIsAdmin,
        nombre: profile?.nombre || '',
        apellidos: profile?.apellidos || '',
        dni: profile?.dni || '',
        nacimiento: profile?.nacimiento || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        email: normalizedEmail,
        isAdmin: defaultIsAdmin,
        nombre: profile?.nombre || '',
        apellidos: profile?.apellidos || '',
        dni: profile?.dni || '',
        nacimiento: profile?.nacimiento || ''
      };
    }

    const userAccessData = userAccessSnapshot.data() as Partial<UserAccessDocument>;
    const isAdmin = userAccessData.isAdmin === true;
    const storedEmail = typeof userAccessData.email === 'string' ? userAccessData.email.toLowerCase() : normalizedEmail;

    const patch: Record<string, unknown> = {};

    if (storedEmail !== normalizedEmail) {
      patch['email'] = normalizedEmail;
    }

    if (profile?.nombre !== undefined) {
      patch['nombre'] = profile.nombre;
    }

    if (profile?.apellidos !== undefined) {
      patch['apellidos'] = profile.apellidos;
    }

    if (profile?.dni !== undefined) {
      patch['dni'] = profile.dni;
    }

    if (profile?.nacimiento !== undefined) {
      patch['nacimiento'] = profile.nacimiento;
    }

    if (Object.keys(patch).length > 0) {
      await setDoc(
        userAccessRef,
        {
          ...patch,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }

    return {
      email: storedEmail !== normalizedEmail ? normalizedEmail : storedEmail,
      isAdmin,
      nombre: String(userAccessData.nombre || ''),
      apellidos: String(userAccessData.apellidos || ''),
      dni: String(userAccessData.dni || ''),
      nacimiento: String(userAccessData.nacimiento || '')
    };
  }

  private clearLocalSession(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedUserUid');
    localStorage.removeItem('loggedUserEmail');
    localStorage.removeItem('loggedUserNombre');
    localStorage.removeItem('loggedUserApellidos');
    this._loggedUserEmail.next(null); // Emitir null cuando la sesión se limpia
  }

  private extractErrorCode(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
      return String((error as {code?: string}).code || '');
    }

    return '';
  }
}
