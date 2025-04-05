import { AsyncPipe, CommonModule, NgForOf, TitleCasePipe } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { filter, first, Observable, Subject, takeUntil } from 'rxjs'
import { Store } from '@ngrx/store'

import * as GameActions from './store/actions/game.actions'
import { AppState } from './store/app.state'
import {
  selectAllCards,
  selectFlippedCards,
  selectGameStatus,
  selectSelectedCategory,
} from './store/selectors/game.selectors'
import { Card, EGameStatus } from './store/reducers/game.reducer'
import { preloadImages } from './utils/preloadImages'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgForOf, AsyncPipe, TitleCasePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly gridSize = 4
  
  canFlip = true

  readonly EGameStatus = EGameStatus
  readonly gameStatus$: Observable<EGameStatus>
  readonly cards$: Observable<Card[]>
  readonly selectedCategory$: Observable<string>
  readonly categories = ['animals', 'nature', 'food', 'travel', 'technology']

  constructor(private readonly store: Store<AppState>) {
    this.cards$ = this.store.select(selectAllCards)
    this.gameStatus$ = this.store.select(selectGameStatus)
    this.selectedCategory$ = this.store.select(selectSelectedCategory)
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.gameStatus$.pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        console.log('Game status changed:', status);
        // do something with status: e.g. trigger animations, alerts, etc.
      });

    // Step 1: select the category → triggers loadCards
    this.selectCategory(this.categories[0])

    // Step 2: wait for real cards (not initial empty array)
    this.cards$
      .pipe(filter((cards) => cards.length > 0), first())
      .subscribe(async (cards) => {
        // Step 3: preload images
        await this.preloadAllGameImages(cards)

        // Step 4: start the game
        this.store.dispatch(GameActions.initializeGame())
      })
  }

  handleCardFlip(event: MouseEvent | KeyboardEvent, cardId: number, card: Card) {
      const isKeyboard = event instanceof KeyboardEvent;
      const isAllowedKey = isKeyboard ? ['Enter', ' '].includes(event.key) : true;
      
      if (!this.canFlip || !isAllowedKey || card.flipped || card.matched) return;

      this.store.select(selectFlippedCards).pipe(first()).subscribe((flipped) => {
        this.flipCard(cardId);
        
        if([...flipped, cardId].length >= 2) {
          this.store.dispatch(GameActions.setGameStatus({ status: EGameStatus.Checking }))
        }
      });
  }

  handleCardClick(event: Event, cardId: number, card: Card) {
    this.handleCardFlip(event as MouseEvent, cardId, card);
  }
  
  handleCardKey(event: Event, cardId: number, card: Card) {
    this.handleCardFlip(event as KeyboardEvent, cardId, card);
  }

  selectCategory(category: string): void {
    this.store.dispatch(GameActions.selectCategory({ category }))
    this.store.dispatch(GameActions.loadCards())
  }

  flipCard(cardId: number): void {
    this.store.dispatch(GameActions.flipCard({ cardId }))
  }

  getLogoPieceUrl(index: number): string {
    const row = Math.floor(index / this.gridSize) + 1
    const col = (index % this.gridSize) + 1
    return `url('/logo/${row}x${col}.svg')`
  }

  resetGame(): void {
    this.store.dispatch(GameActions.resetGame())
  }

  // Avoid all cards are rendered together which will destroy the card flip effect
  trackByCardId(_: number, card: Card): number {
    return card.id
  }

  private async preloadAllGameImages(cards: Card[]) {
    const tileCount = this.gridSize * this.gridSize
    const tilesImagePaths = Array.from({ length: tileCount }, (_, i) => {
      const row = Math.floor(i / this.gridSize) + 1
      const col = (i % this.gridSize) + 1
      return `/logo/${row}x${col}.svg`
    })

    const cardImagePaths = cards.map((card) => card.imageUrl)

    await preloadImages([...tilesImagePaths, ...cardImagePaths])
  }
}
