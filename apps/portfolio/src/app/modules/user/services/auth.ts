// auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
    // Inject the Supabase Client
    private supabase = inject(SupabaseClient);

    // Expose a read-only signal for tracking user state reactively
    currentUser = signal<User | null | undefined>(undefined);

    constructor() {
        // Fetch current session and subscribe to subsequent auth changes
        this.supabase.auth.getSession().then(({ data: { session } }) => {
            this.currentUser.set(session?.user ?? null);

            this.supabase.auth.onAuthStateChange((_event, session) => {
                this.currentUser.set(session?.user ?? null);
            });
        }).catch(() => {
            this.currentUser.set(null);
        });
    }

    // Register a new user
    async register(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }

    // Sign in existing user
    async login(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }


    // Logout
    async logout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }
}
