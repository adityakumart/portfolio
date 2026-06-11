// auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import {
    Auth,
    user,
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from '@angular/fire/auth';

@Injectable()
export class AuthService {
    // Inject the Auth instance configured in app.config.ts
    private auth = inject(Auth);

    // Expose a read-only signal for tracking user state reactively
    currentUser = signal<User | null | undefined>(undefined);

    constructor() {
        // Wait for initial auth state verification to complete
        this.auth.authStateReady().then(() => {
            // Set the initial verified user state
            this.currentUser.set(this.auth.currentUser);

            // Subscribe to subsequent auth changes
            user(this.auth).subscribe((userState) => {
                this.currentUser.set(userState);
            });
        });
    }

    // Register a new user
    async register(email: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }

    // Sign in existing user
    async login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    // Sign in/up with Google
    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(this.auth, provider);
    }

    // Logout
    async logout() {
        return signOut(this.auth);
    }
}
