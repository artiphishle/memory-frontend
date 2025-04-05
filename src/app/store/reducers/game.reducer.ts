import { createReducer, on } from '@ngrx/store'
import * as GameActions from '../actions/game.actions'

export interface UnsplashImage {
  readonly title: string
  readonly url: string
  // Not an exhaustive list (add more if useful)
}
export interface Card {
  readonly id: number
  readonly pairId: number
  readonly imageUrl: string
  readonly label: string
  readonly name: string
  readonly flipped: boolean
  readonly matched: boolean
  readonly revealedLogo?: boolean
}

export enum EGameStatus {
  Checking = 'checking',
  Completed = 'completed',
  Idle = 'idle',
  Loading = 'loading',
  Playing = 'playing',
  Ready = 'ready',
}
export interface GameState {
  cards: Card[]
  selectedCategory: string
  flippedCards: number[]
  matchedPairs: number
  totalPairs: number
  gameStatus: EGameStatus
  loading: boolean
  error: string | null
}

export const initialState: GameState = {
  cards: [],
  selectedCategory: 'animals',
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 8, // We'll use 8 pairs (16 cards, 4x4 grid)
  gameStatus: EGameStatus.Idle,
  loading: false,
  error: null,
}

export const gameReducer = createReducer(
  initialState,

  on(GameActions.initializeGame, (state) => ({
    ...state,
    gameStatus: EGameStatus.Playing,
    flippedCards: [],
    matchedPairs: 0,
  })),

  on(GameActions.selectCategory, (state, { category }) => ({
    ...state,
    selectedCategory: category,
  })),

  on(GameActions.loadCards, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(GameActions.loadCardsSuccess, (state, { cards }) => ({
    ...state,
    cards,
    loading: false,
    flippedCards: [],
    matchedPairs: 0,
  })),

  on(GameActions.loadCardsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(GameActions.flipCard, (state, { cardId }) => {
    if (state.flippedCards.length >= 2 || state.gameStatus !== EGameStatus.Playing) return state

    const updatedCards = state.cards.map((card) =>
      card.id === cardId ? { ...card, flipped: true } : card,
    )

    const flipped = [...state.flippedCards, cardId]

    return {
      ...state,
      cards: updatedCards,
      flippedCards: flipped,
      gameStatus: flipped.length === 2 ? EGameStatus.Checking : state.gameStatus,
    }
  }),

  on(GameActions.matchFound, (state, { cardIds }) => ({
    ...state,
    cards: state.cards.map((card) =>
      cardIds.includes(card.id) ? { ...card, matched: true } : card,
    ),
    flippedCards: [],
    matchedPairs: state.matchedPairs + 1,
    gameStatus: EGameStatus.Playing,
  })),

  on(GameActions.noMatchFound, (state) => ({
    ...state,
    flippedCards: [],
    gameStatus: EGameStatus.Playing,
  })),

  on(GameActions.resetGame, () => ({
    ...initialState,
  })),

  on(GameActions.gameCompleted, (state) => ({
    ...state,
    gameStatus: EGameStatus.Completed,
  })),

  on(GameActions.setGameStatus, (state, { status }) => ({
    ...state,
    gameStatus: status,
  })),
)
