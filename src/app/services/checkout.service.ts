import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private baseUrl = 'http://localhost:8282/checkout';

  constructor(private http: HttpClient) {}

  createStripeCheckout(shippingAddress: any): Observable<{ url: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User is not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<{ url: string }>(
      `${this.baseUrl}/stripe`,
      { shippingAddress: shippingAddress },
      { headers }
    );
  }
}
