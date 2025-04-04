import { createAction, props } from "@ngrx/store"
import { EGameStatus } from "../reducers/game.reducer"

export const initializeGame = createAction("[Game] Initialize Game")
export const selectCategory = createAction("[Game] Select Category", props<{ category: string }>())
export const loadCards = createAction("[Game] Load Cards")
export const loadCardsSuccess = createAction("[Game] Load Cards Success", props<{ cards: any[] }>())
export const loadCardsFailure = createAction("[Game] Load Cards Failure", props<{ error: any }>())
export const flipCard = createAction("[Game] Flip Card", props<{ cardId: number }>())
export const checkMatch = createAction("[Game] Check Match")
export const matchFound = createAction("[Game] Match Found", props<{ cardIds: number[] }>())
export const noMatchFound = createAction("[Game] No Match Found", props<{ cardIds: number[] }>())
export const resetGame = createAction("[Game] Reset Game")
export const gameCompleted = createAction("[Game] Game Completed")
export const setGameStatus = createAction('[Game] Set Game Status',props<{ status: EGameStatus}>());

