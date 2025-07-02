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
  // userOrders = [
  //   {
  //     id: 'ORD1234',
  //     date: '2025-06-29',
  //     total: 350,
  //     status: 'Delivered',
  //   },
  //   {
  //     id: 'ORD1235',
  //     date: '2025-06-25',
  //     total: 120,
  //     status: 'Pending',
  //   },
  //   {
  //     id: 'ORD1236',
  //     date: '2025-06-20',
  //     total: 200,
  //     status: 'Cancelled',
  //   },
  // ];
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
}
