import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // استيراد FormsModule

import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { ConfirmPaymentComponent } from '../confirm-payment/confirm-payment.component';
import { CartsService } from '../../services/carts.service';
import { CheckoutService } from '../../services/checkout.service';

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
  selectedPayment: string = 'cash'; //

  firstName: string = '';
  cardNumber: string = '';
  expiryDate: string = '';
  cvv: string = '';
  saveCard: boolean = false;
  showConfirmPayment = false;

  constructor(
    private cartService: CartsService,
    private checkoutService: CheckoutService
  ) {}

  toggleConfirmPayment() {
    this.showConfirmPayment = true;
  }

  setPaymentMethod(method: string) {
    this.selectedPayment = method;
  }

  proceedToStripe() {
    this.checkoutService.createCheckoutSession().subscribe({
      next: res => {
        window.location.href = res.url;
      },
      error: err => {
        console.log('Checkout error', err);
      },
    });
  }
}
