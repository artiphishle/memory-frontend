import { AsyncPipe, CommonModule, NgForOf, TitleCasePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { filter, first, Observable } from "rxjs";
import { Store } from "@ngrx/store";

import * as GameActions from "./store/actions/game.actions";
import { AppState } from "./store/app.state";
import { selectAllCards, selectGameStatus, selectSelectedCategory } from "./store/selectors/game.selectors";
import { Card, EGameStatus } from "./store/reducers/game.reducer";
import { preloadImages } from "./utils/preloadImages";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgForOf, AsyncPipe, TitleCasePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly gridSize = 4;
  readonly EGameStatus = EGameStatus;
  readonly gameStatus$: Observable<EGameStatus>;
  readonly cards$: Observable<Card[]>;
  readonly selectedCategory$: Observable<string>;
  readonly categories = ['animals', 'nature', 'food', 'travel', 'technology'];

  constructor(private readonly store: Store<AppState>) {
    this.cards$ = this.store.select(selectAllCards);
    this.gameStatus$ = this.store.select(selectGameStatus);
    this.selectedCategory$ = this.store.select(selectSelectedCategory);
  }

  ngOnInit(): void {
    // Step 1: select the category → triggers loadCards
    this.selectCategory(this.categories[0]);
  
    // Step 2: wait for real cards (not initial empty array)
    this.cards$.pipe(
      filter((cards) => cards.length > 0), // wait for real content
      first()
    ).subscribe(async (cards) => {
      // Step 3: preload images
      await this.preloadAllGameImages(cards);
  
      // Step 4: start the game
      this.store.dispatch(GameActions.initializeGame());
    });
  }

  handleCardFlip(event: MouseEvent | KeyboardEvent, cardId: number, card: Card, gameStatus: EGameStatus) {
    const isKeyboard = event instanceof KeyboardEvent;
    const isAllowedKey = isKeyboard ? ['Enter', ' '].includes(event.key) : true;
  
    if (
      gameStatus === EGameStatus.Playing &&
      !card.flipped &&
      !card.matched &&
      isAllowedKey
    ) {
      this.flipCard(cardId);
    }
  }

  selectCategory(category: string): void {
    this.store.dispatch(GameActions.selectCategory({ category }));
    this.store.dispatch(GameActions.loadCards());
  }

  flipCard(cardId: number): void {
    this.store.dispatch(GameActions.flipCard({ cardId }));
  }

  getLogoPieceUrl(index: number): string {
    const row = Math.floor(index / this.gridSize) + 1;
    const col = (index % this.gridSize) + 1;
    return `url('/logo/${row}x${col}.svg')`;
  }

  resetGame(): void {
    this.store.dispatch(GameActions.resetGame());
  }

  // Required to avoid rerendering all cards which would destroy the card flip effect
  trackByCardId(index: number, card: Card): number {
    return card.id;
  }

  private async preloadAllGameImages(cards: Card[]) {
    const tileCount = this.gridSize * this.gridSize;
    const tilesImagePaths = Array.from({ length: tileCount }, (_, i) => {
      const row = Math.floor(i / this.gridSize) + 1;
      const col = (i % this.gridSize) + 1;
      return `/logo/${row}x${col}.svg`;
    });

    const cardImagePaths = cards.map((card) => card.imageUrl);

    await preloadImages([...tilesImagePaths, ...cardImagePaths]);

    console.log('✅ All images preloaded');
  }

  
}
