import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private baseUrl = 'http://localhost:8282/checkout';

  constructor(private http: HttpClient) {}

  createCheckoutSession() {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<{ url: string }>(
      `${this.baseUrl}/stripe`,
      {},
      { headers }
    );
  }
}
