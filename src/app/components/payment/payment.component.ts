import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Cart, CartItem } from '../../models/cart.model';
import { Product } from '../../models/product.model';
import { CartsService } from '../../services/carts.service';
@Component({
  selector: 'app-payment',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent {
  paymentForm: FormGroup;
  cart: Cart = {};
  cartItems: CartItem[] = [];
  totalItems = 0;
  subtotal = 0;
  discount = 0;
  shipping = 0;
  total = 0;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartsService
  ) {
    this.paymentForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^01[0-9]{9}$')]],
      FirstName: ['', [Validators.required]],
      LastName: ['', [Validators.required]],
      Street: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          ),
        ],
      ],
    });
  }

  get phone() {
    return this.paymentForm.get('phone');
  }

  get FirstName() {
    return this.paymentForm.get('FirstName');
  }
  get LastName() {
    return this.paymentForm.get('LastName');
  }

  get Street() {
    return this.paymentForm.get('Street');
  }

  get City() {
    return this.paymentForm.get('City');
  }

  get Email() {
    return this.paymentForm.get('Email');
  }
  submitForm() {
    if (this.paymentForm.valid) {
      this.router.navigate(['/payment-methods']);
      console.log('Form Submitted:', this.paymentForm.value);
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }

  checkInputValue(field: string) {
    const control = this.paymentForm.get(field);
    if (control?.value) {
      control.markAsTouched();
    }
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
}

