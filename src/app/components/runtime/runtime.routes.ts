import { Routes } from '@angular/router';
import { LoginGuard } from '../../guards/login.guard';
import { PlaylistResolver } from '../../resolvers/playlist.resolver';
import { RuntimeComponent } from './runtime.component';

export const runtimeRoutes: Routes = [
    {
        path: '',
        component: RuntimeComponent,
        canActivate: [LoginGuard],
        children: [
            {
                path: 'playlist/:id',
                loadChildren: (): Promise<unknown> =>
                    import('./playlist-runtime/playlist-runtime.module').then(
                        (m) => m.PlaylistRuntimeModule
                    ),
                data: {
                    title: 'Running Playlist'
                },
                resolve: {
                    playlist: PlaylistResolver
                }
            }
        ]
    }
];
