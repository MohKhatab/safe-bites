import { Component } from '@angular/core';
import { ConfirmPaymentComponent } from '../confirm-payment/confirm-payment.component';
import { RouterModule } from '@angular/router';
import { Cart, CartItem } from '../../models/cart.model';
import { CartsService } from '../../services/carts.service';

@Component({
  selector: 'app-order-summary',
  standalone: true, //
  imports: [RouterModule, ConfirmPaymentComponent],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
})
export class OrderSummaryComponent {
  showConfirmPayment = false;
  cart: Cart = {};
  cartItems: CartItem[] = [];
  totalItems = 0;
  subtotal = 0;
  discount = 0;
  shipping = 0;
  total = 0;
  selectedPayment: string = 'cash';
  constructor(private cartService: CartsService) {}
  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.cartService.getCart(token);
      this.cartService.cart$.subscribe(cart => {
        this.cart = cart;
        this.processCart();
      });
    }
  }
  processCart() {
    const products = Object.values(this.cart);
    this.cartItems = products;
    this.totalItems = products.reduce(
      (acc, item) => acc + +(item.quantity || 0),
      0
    );

    this.subtotal = products.reduce((acc, item) => {
      return acc + +(item.price || 0) * +(item.quantity || 0);
    }, 0);

    this.discount = this.subtotal >= 200 ? 50 : 0;
    this.shipping = this.subtotal > 0 ? 0 : 0;
    this.total = this.subtotal - this.discount + this.shipping;
  }

  toggleConfirmPayment() {
    this.showConfirmPayment = true;
  }
}

