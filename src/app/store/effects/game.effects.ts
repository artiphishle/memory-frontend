import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { map, mergeMap, catchError, withLatestFrom, delay } from "rxjs/operators";
import { Store } from "@ngrx/store";
import * as GameActions from "../actions/game.actions";
import { AppState } from "../app.state";
import { selectFlippedCards, selectGameState } from "../selectors/game.selectors";
import { GameService } from "../../services/game.service";

@Injectable()
export class GameEffects {
  loadCards$;
  checkMatch$;
  resetFlippedCards$;
  revealMatchedCards$;
  gameCompleted$;

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private gameService: GameService
  ) {
    this.loadCards$ = createEffect(() =>
      this.actions$.pipe(
        ofType(GameActions.loadCards),
        withLatestFrom(this.store.select(selectGameState)),
        mergeMap(([, state]) =>
          this.gameService.getCardsByCategory(state.selectedCategory).pipe(
            map((cards) => GameActions.loadCardsSuccess({ cards })),
            catchError((error) => of(GameActions.loadCardsFailure({ error })))
          )
        )
      )
    );

    this.checkMatch$ = createEffect(() =>
      this.actions$.pipe(
        ofType(GameActions.flipCard),
        withLatestFrom(
          this.store.select(selectFlippedCards),
          this.store.select(selectGameState)
        ),
        map(([, flippedCards, state]) => {
          if (flippedCards.length === 2) {
            const card1 = state.cards.find((c) => c.id === flippedCards[0]);
            const card2 = state.cards.find((c) => c.id === flippedCards[1]);

            if (card1?.pairId === card2?.pairId) {
              return GameActions.matchFound({ cardIds: flippedCards });
            } else {
              return GameActions.noMatchFound({ cardIds: flippedCards });
            }
          }
          return { type: "NO_ACTION" };
        })
      )
    );

    this.resetFlippedCards$ = createEffect(() =>
      this.actions$.pipe(
        ofType(GameActions.noMatchFound),
        delay(1000),
        withLatestFrom(this.store.select(selectGameState)),
        map(([action, state]) => {
          const updatedCards = state.cards.map((card) =>
            action.cardIds.includes(card.id)
              ? { ...card, flipped: false }
              : card
          );

          return GameActions.loadCardsSuccess({ cards: updatedCards });
        })
      )
    );

    this.revealMatchedCards$ = createEffect(() =>
      this.actions$.pipe(
        ofType(GameActions.matchFound),
        delay(1000),
        withLatestFrom(this.store.select(selectGameState)),
        map(([action, state]) => {
          const updatedCards = state.cards.map((card) =>
            action.cardIds.includes(card.id)
              ? { ...card, revealedLogo: true }
              : card
          );

          return GameActions.loadCardsSuccess({ cards: updatedCards });
        })
      )
    );

    this.gameCompleted$ = createEffect(() =>
      this.actions$.pipe(
        ofType(GameActions.matchFound),
        withLatestFrom(this.store.select(selectGameState)),
        map(([, state]) => {
          if (state.matchedPairs === state.totalPairs) {
            return GameActions.gameCompleted();
          }
          return { type: "NO_ACTION" };
        })
      )
    );
  }
}
