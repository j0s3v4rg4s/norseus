import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { SessionSignalStore } from '@front/state/session';
import { LayoutStore, MenuItem } from '@ui';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private auth = inject(Auth);
  private layoutStore = inject(LayoutStore);
  private sessionStore = inject(SessionSignalStore);
  private router = inject(Router);

  readonly menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'home',
      subItems: [
        { label: 'Estadísticas', icon: 'bar_chart', route: '/home/statistics' },
        { label: 'Usuarios', icon: 'group', route: '/home/users' },
      ],
    },
    { label: 'About', icon: 'info', route: '/about' },
    { label: 'Permisos', icon: 'lock', route: '/home/permissions' },
    { label: 'Servicios', icon: 'fitness_center', route: '/home/services' },
  ];

  ngOnInit(): void {
    this.loadUserData();
    this.layoutStore.setMenuItems(this.menuItems);
    this.layoutStore.setLogo('logos/logo_name.svg');
    this.layoutStore.setIcon('logos/icon.svg');
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
