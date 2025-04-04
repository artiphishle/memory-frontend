import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { map, catchError } from "rxjs/operators"
import type { Card } from "../store/reducers/game.reducer"

@Injectable({
  providedIn: "root",
})
export class GameService {
  private apiUrl = "http://localhost:8080/api" // Spring Boot backend URL

  constructor(private http: HttpClient) {}

  getCardsByCategory(category: string): Observable<Card[]> {
    return this.http.get<any[]>(`${this.apiUrl}/images?category=${category}`).pipe(
      map((images) => this.prepareCards(images)),
      catchError((error) => {
        console.error("Error fetching images:", error)
        return of(this.getFallbackCards()) // Fallback to local data if API fails
      }),
    )
  }

  private prepareCards(images: any[]): Card[] {
    // Take 8 images for 8 pairs (16 cards total)
    const selectedImages = images.slice(0, 8)

    // Create pairs
    const cards: Card[] = []
    let id = 0

    selectedImages.forEach((image, index) => {
      // Create two cards with the same pairId
      const card1: Card = {
        id: id++,
        pairId: index,
        imageUrl: image.url,
        label: "Card",
        name: image.title || `Card ${index}`,
        flipped: false,
        matched: false,
      }

      const card2: Card = {
        id: id++,
        pairId: index,
        imageUrl: image.url,
        label: "Card",
        name: image.title || `Card ${index}`,
        flipped: false,
        matched: false,
      }

      cards.push(card1, card2)
    })

    // Shuffle the cards
    return this.shuffleCards(cards)
  }

  private shuffleCards(cards: Card[]): Card[] {
    const shuffled = [...cards]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private getFallbackCards(): Card[] {
    // Generate placeholder cards if API fails
    const placeholders = Array(8)
      .fill(0)
      .map((_, i) => ({
        id: i,
        title: `Placeholder ${i}`,
        url: `https://via.placeholder.com/150?text=Card+${i}`,
      }))

    return this.prepareCards(placeholders)
  }
}

