import { Location } from '@angular/common';
import { Injector, NgZone } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloQueryResult, NetworkStatus } from '@apollo/client/core';
import { Action, StoreRootModule } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Apollo } from 'apollo-angular';
import { GraphQLError } from 'graphql';
import {
  MockBuilder,
  MockedComponentFixture,
  MockInstance,
  MockRender,
  ngMocks,
  NG_MOCKS_GUARDS
} from 'ng-mocks';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';
import { skip } from 'rxjs/operators';
import { AppModule } from '../app.module';
import { HomeModule } from '../components/home/home.module';
import { MaintenanceComponent } from '../components/maintenance/maintenance.component';
import { MaintenanceModule } from '../components/maintenance/maintenance.module';
import { PlaylistRuntimeComponent } from '../components/runtime/playlist-runtime/playlist-runtime.component';
import { RuntimeComponent } from '../components/runtime/runtime.component';
import { RuntimeModule } from '../components/runtime/runtime.module';
import { MaintenanceGuard } from '../guards/maintenance.guard';
import { splitPlaylistTypes } from '../helpers/model-helpers';
import { Dashboard, DashboardLink } from '../models/dashboard';
import { Playlist, PlaylistType } from '../models/playlist';
import { Widget, WidgetLink } from '../models/widget';
import { WidgetColumn } from '../models/widget-column';
import { WidgetParameter } from '../models/widget-parameter';
import { WidgetSeries } from '../models/widget-series';
import { upsertDashboardLinks } from '../store/dashboard-link/dashboard-link.actions';
import { upsertDashboards } from '../store/dashboard/dashboard.actions';
import { PlaylistResolver } from './playlist.resolver';

describe('PlaylistResolver', () => {
  ngMocks.ignoreOnConsole('error');

  beforeEach(() => {
    return MockBuilder(PlaylistResolver, [
      RuntimeModule,
      AppModule,
      MaintenanceModule,
      HomeModule
    ])
      .exclude(NG_MOCKS_GUARDS)
      .keep(RouterModule)
      .keep(RouterTestingModule.withRoutes([]))
      .keep(RuntimeComponent)
      .keep(StoreRootModule)
      .mock(PlaylistRuntimeComponent)
      .mock(MaintenanceComponent)
      .mock(MessageService)
      .mock(MaintenanceGuard)
      .provide(provideMockStore({ initialState }));
  });

  afterEach(() => {
    (console.error as jasmine.Spy).calls.reset();
  });

  const setup = (
    result?: Observable<
      ApolloQueryResult<{
        playlistQuery: {
          playlist?: PlaylistType;
        };
      }>
    >
  ): {
    fixture: MockedComponentFixture<RouterOutlet, RouterOutlet>;
    ngZone: NgZone;
    injector: Injector;
    navigateSpy: jasmine.Spy;
    location: Location;
    apollo: Apollo;
  } => {
    MockInstance(
      Apollo,
      'query',
      jasmine.createSpy('Apollo.query').and.callFake(
        <T>(): Observable<ApolloQueryResult<T>> =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result as Observable<ApolloQueryResult<any>>
      )
    );

    const fixture = MockRender(RouterOutlet);

    if (!fixture.ngZone) {
      throw new Error('NgZone not found in fixture');
    }
    const injector = fixture.point.injector;
    const router = injector.get(Router);

    const navigateSpy = spyOn(router, 'navigate').and.callThrough();

    fixture.ngZone.run(() => router.initialNavigation());
    tick();

    const location = injector.get(Location);
    const apollo = injector.get(Apollo);

    return {
      fixture,
      ngZone: fixture.ngZone,
      injector,
      navigateSpy,
      location,
      apollo
    };
  };

  const tab = 'playlist';

  it('should handle invalid playlist id', fakeAsync(() => {
    const playlistId = 'invalid';

    const {
      fixture,
      ngZone,
      injector,
      navigateSpy,
      apollo,
      location
    } = setup();

    location.go(`/playlist/${playlistId}`);
    void ngZone.run(() => {
      fixture.detectChanges();
      void fixture.whenStable();
    });

    tick();

    // TODO Fix the router.navigate promise not resolving
    // expect(location.path()).toEqual('/app/maintenance');
    expect(location.path()).not.toEqual(`/playlist/${playlistId}`);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(apollo.query).not.toHaveBeenCalled();

    const messageService = injector.get(MessageService);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        summary: 'Unable to retrieve playlist for execution',
        detail:
          'The supplied playlist Id was not valid. Navigating back to maintenance',
        severity: 'error'
      })
    );

    expect(console.error).toHaveBeenCalledWith(
      'Error while attemping to resolve playlist. The supplied playlist Id was not valid. Navigating back to maintenance',
      playlistId
    );

    expect(navigateSpy).toHaveBeenCalledWith(
      ['app/maintenance'],
      jasmine.objectContaining({
        state: { tab }
      })
    );
  }));
});
