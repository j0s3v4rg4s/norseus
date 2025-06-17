import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SUPABASE } from '@front/supabase';
import { ProfileSignalStore } from '@front/core/profile';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private supabase = inject(SUPABASE);
  private profileStore = inject(ProfileSignalStore);

  ngOnInit(): void {
    this.loadUserData();
  }

  async loadUserData() {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION' && session) {
        const userId = session.user.id;
        this.profileStore.loadProfile(userId);
      }
    });
  }
}
