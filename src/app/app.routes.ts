import { Routes } from '@angular/router';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'app',
    loadChildren: (): Promise<unknown> =>
      import('./components/home/home.module').then(m => m.HomeModule),
    canLoad: [LoginGuard]
  }
];
