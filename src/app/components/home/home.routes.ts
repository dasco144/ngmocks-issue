import { Routes } from '@angular/router';
import { MaintenanceGuard } from '../../guards/maintenance.guard';
import { HomeComponent } from './home.component';

export const homeRoutes: Routes = [
    {
        path: '',
        component: HomeComponent,
        // canActivate: [LoginGuard],
        children: [
            {
                path: 'my-playlists',
                loadChildren: (): Promise<unknown> =>
                    import('../my-playlists/my-playlists.module').then(
                        (m) => m.MyPlaylistsModule
                    )
            },
            {
                path: 'maintenance',
                loadChildren: (): Promise<unknown> =>
                    import('../maintenance/maintenance.module').then(
                        (m) => m.MaintenanceModule
                    ),
                canLoad: [MaintenanceGuard],
                data: {
                    title: 'Maintenance'
                }
            }
        ]
    }
];
