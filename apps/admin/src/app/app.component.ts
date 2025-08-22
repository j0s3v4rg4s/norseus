import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { SessionSignalStore } from '@front/state/session';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private auth = inject(Auth);
  private sessionStore = inject(SessionSignalStore);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData() {
    user(this.auth).subscribe((user) => {
      if (user) {
        this.sessionStore.initAsEmployer(user.uid);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
