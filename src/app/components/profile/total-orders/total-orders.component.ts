import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-total-orders',
  imports: [CommonModule],
  templateUrl: './total-orders.component.html',
  styleUrl: './total-orders.component.css',
})
export class TotalOrdersComponent {
  userOrders: any[] = [];
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: res => {
        this.userOrders = res.data;
        this.loading = false;
      },
      error: err => {
        console.log('Error fetching orders.', err);
        this.loading = false;
      },
    });
  }
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
