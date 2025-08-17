import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = 'http://localhost:8282/orders';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  createOrder(orderData: any): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}`, orderData, { headers });
  }

  getUserOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my-orders`, {
      headers: this.getHeaders(),
    });
  }

  getOrderById(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${orderId}`, {
      headers: this.getHeaders(),
    });
  }
}
