import { createSelector, createFeatureSelector } from "@ngrx/store"
import type { GameState } from "../reducers/game.reducer"

export const selectGameState = createFeatureSelector<GameState>("game")

export const selectAllCards = createSelector(selectGameState, (state: GameState) => state.cards)

export const selectFlippedCards = createSelector(selectGameState, (state: GameState) => state.flippedCards)

export const selectMatchedPairs = createSelector(selectGameState, (state: GameState) => state.matchedPairs)

export const selectTotalPairs = createSelector(selectGameState, (state: GameState) => state.totalPairs)

export const selectGameStatus = createSelector(selectGameState, (state: GameState) => state.gameStatus)

export const selectSelectedCategory = createSelector(selectGameState, (state: GameState) => state.selectedCategory)

export const selectIsLoading = createSelector(selectGameState, (state: GameState) => state.loading)

export const selectError = createSelector(selectGameState, (state: GameState) => state.error)

