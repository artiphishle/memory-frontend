import { importProvidersFrom } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideHttpClient } from '@angular/common/http'

import { AppComponent } from './app/app.component'

import { StoreModule } from '@ngrx/store'
import { EffectsModule } from '@ngrx/effects'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'

import { gameReducer } from './app/store/reducers/game.reducer'
import { GameEffects } from './app/store/effects/game.effects'

import { environment } from './environments/environment'

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),

    importProvidersFrom(
      StoreModule.forRoot({ game: gameReducer }),
      EffectsModule.forRoot([GameEffects]),
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: environment.production,
      }),
    ),
  ],
}).catch((err) => console.error(err))
