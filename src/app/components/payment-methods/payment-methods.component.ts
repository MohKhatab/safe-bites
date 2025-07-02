import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // استيراد FormsModule

import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { ConfirmPaymentComponent } from '../confirm-payment/confirm-payment.component';
import { CartsService } from '../../services/carts.service';
import { Cart, CartItem } from '../../models/cart.model';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    OrderSummaryComponent,
    ConfirmPaymentComponent,
  ],
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css'],
})
export class PaymentMethodsComponent {
  cart: Cart = {};
  cartItems: CartItem[] = [];
  totalItems = 0;
  subtotal = 0;
  discount = 0;
  shipping = 0;
  total = 0;
  selectedPayment: string = 'cash';

  firstName: string = '';
  cardNumber: string = '';
  expiryDate: string = '';
  cvv: string = '';
  saveCard: boolean = false;
  showConfirmPayment = false;

  constructor(private cartService: CartsService) {}

  toggleConfirmPayment() {
    this.showConfirmPayment = true;
  }

  setPaymentMethod(method: string) {
    this.selectedPayment = method;
  }
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
    this.totalItems = products.length;
    this.subtotal = products.reduce((acc, item) => {
      return acc + +(item.price || 0) * +(item.quantity || 0);
    }, 0);

    this.discount = this.subtotal >= 200 ? 50 : 0;
    this.shipping = this.subtotal > 0 ? 0 : 0;
    this.total = this.subtotal - this.discount + this.shipping;
  }
}
