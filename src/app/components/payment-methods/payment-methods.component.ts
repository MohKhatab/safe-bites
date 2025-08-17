import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { OrderSummaryComponent } from '../order-summary/order-summary.component';
// import { ConfirmPaymentComponent } from '../confirm-payment/confirm-payment.component';
import { CartsService } from '../../services/carts.service';
import { Cart, CartItem } from '../../models/cart.model';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    OrderSummaryComponent,
    // ConfirmPaymentComponent,
  ],
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css'],
})
export class PaymentMethodsComponent implements OnInit {
  // تطبيق OnInit

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

  shippingAddress: any;

  constructor(
    private cartService: CartsService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.cartService.getCart(token);
      this.cartService.cart$.subscribe(cart => {
        this.cart = cart;
        this.processCart();
      });
    }

    const storedShippingAddress = localStorage.getItem('shippingAddress');
    if (storedShippingAddress) {
      this.shippingAddress = JSON.parse(storedShippingAddress);
    } else {
      console.warn(
        'Shipping address not found in localStorage. Redirecting to payment details.'
      );
      this.router.navigate(['/payment']);
    }
  }

  setPaymentMethod(method: string) {
    this.selectedPayment = method;
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

  onProceedToPayment() {
    if (this.selectedPayment === 'card') {
      if (!this.shippingAddress) {
        alert(
          'Shipping address is missing. Please go back and fill your details.'
        );
        this.router.navigate(['/payment']);
        return;
      }
      this.checkoutService
        .createStripeCheckout(this.shippingAddress)
        .subscribe({
          next: res => {
            window.location.href = res.url;
          },
          error: err => {
            console.error('Stripe checkout error', err);
            alert(
              'There was an error processing your payment. Please try again.'
            );
          },
        });
    } else if (this.selectedPayment === 'cash') {
      alert('Cash on Delivery selected. Implement your COD logic here.');
    } else {
      alert('Please select a payment method.');
    }
  }
}
