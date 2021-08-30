import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlaylistResolver } from '../../resolvers/playlist.resolver';
import { RuntimeComponent } from './runtime.component';
import { runtimeRoutes } from './runtime.routes';

@NgModule({
  declarations: [RuntimeComponent],
  imports: [RouterModule.forChild(runtimeRoutes)],
  exports: [RouterModule],
  providers: [PlaylistResolver]
})
export class RuntimeModule {}
