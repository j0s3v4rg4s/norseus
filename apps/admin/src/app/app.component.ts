import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SUPABASE } from '@front/supabase';
import type { Database, Facility, Profile } from '@front/supabase';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private supabase = inject(SUPABASE);

  ngOnInit(): void {
    this.loadUserData();
  }

  async loadUserData() {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION' && session) {
        const userId = session.user.id;
        const profile = await this.getProfile(userId);
        const facilities = await this.getFacilities();
        console.log(profile, facilities);
      }
    });
  }

  async getProfile(userId: string): Promise<Profile> {
    const { data: profile, error: profileError } = await this.supabase
      .from('profile')
      .select('*')
      .eq('id', userId)
      .single();
    if (profileError) {
      throw profileError;
    }
    return profile;
  }

  async getFacilities(): Promise<Facility[]> {
    const { data: facilities, error: facilitiesError } = await this.supabase.from('facility').select('*');
    if (facilitiesError) {
      throw facilitiesError;
    }
    return facilities;
  }
}
