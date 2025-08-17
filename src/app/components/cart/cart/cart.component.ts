import { Component } from '@angular/core';
import { CartsService } from '../../../services/carts.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Cart, CartItem } from '../../../models/cart.model';
import { Product } from '../../../models/product.model';
import { ProductsService } from '../../../services/products.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  cart?: Cart;
  cartItems: CartItem[] = [];
  showPopup: boolean = false;
  token: string | null = localStorage.getItem('token');
  constructor(
    private cartService: CartsService,
    private productService: ProductsService,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.cartService.cart$.subscribe({
      next: data => {
        this.cart = data;
        this.cartItems = Object.values(this.cart);
      },
      error: err => {
        console.log(err);
      },
    });
  }

  removeproduct(productId: string | undefined) {
    if (this.token && productId) {
      this.cartService.removeFromCart(productId, this.token);
    }
  }

  decreaseQuantity(product: any) {
    // if (product.quantity > 1) {
    //   const newQuantity = product.quantity - 1;
    //   this.updateCart(product._id, newQuantity, 'decrease');
    //   product.quantity--;
    // }
    if (product.quantity > 1) {
      product.quantity--;
    }
  }
  increaseQuantity(product: any) {
    product.quantity++;
  }

  calculateSubTotal(product: any) {
    return product.price * product.quantity;
  }

  calculateTotalItems() {
    if (this.cart)
      return Object.values(this.cart).reduce(
        (total: number, product: any) => total + product.quantity,
        0
      );
    return 0;
  }

  calculateTotalPrice() {
    if (this.cart)
      return Object.values(this.cart).reduce(
        (total: number, product: any) =>
          total + this.calculateSubTotal(product),
        0
      );
    return 0;
  }

  clearCart() {
    if (this.token) {
      this.cartService.clearCart(this.token);
      this.toastr.success('Cleard cart successfully');
    }
    this.showPopup = false;
  }

  track(index: number, product: any): any {
    return product.id;
  }
}

/*
ngOnInit() {
  this.CartsService.getAllProducts().subscribe({
    next: (response: any) => {
      if (Array.isArray(response)) {
        this.cart = response.map(product => ({
          ...product,
          quantity: product.quantity || 1,
        }));
      }
    },
    error: err => console.log(err),
  });
}
removeproduct(productToRemove: any) {
  this.CartsService.deleteProduct(productToRemove.id).subscribe({
    next: response => {
      console.log('Product deleted successfully:', response);

      this.cart = this.cart.filter(
        (product: any) => product.id !== productToRemove.id
      );
    },
    error: err => {
      console.log('Error deleting product:', err);
    },
  });
}
decreaseQuantity(product: any) {
  if (product.quantity > 1) {
    product.quantity--;
  }
}

increaseQuantity(product: any) {
  product.quantity++;

   /*
    this.productService.getProductById(product._id).subscribe({
      next: (response: any) => {
        const availableQuantity = response.data.quantity;
        const requestedQuantityInCart = product.quantity + 1;

        if (requestedQuantityInCart > availableQuantity) {
          this.toastr.error(
            `The requested quantity is not available.`,
            'error'
          );
        } else {
          const newQuantityInCart = product.quantity + 1;
          this.updateCart(product._id, newQuantityInCart, 'increase');
          // product.quantity++;
        }
      },
      error: (error: any) => {
        console.error('Error fetching product details', error);
        this.toastr.error(
          'An error occurred while checking the available quantity.',
          'error'
        );
      },
    });
    

}
calculateSubTotal(product: any) {
  return product.price * product.quantity;
}
calculateTotalItems() {
  return this.cart.reduce(
    (total: number, product: any) => total + product.quantity,
    0
  );
}
calculateTotalPrice() {
  return this.cart.reduce(
    (total: number, product: any) => total + this.calculateSubTotal(product),
    0
  );
}

clearCart() {
  if (!this.cart || this.cart.length === 0) return;

  this.CartsService.clearCartFromBackend(this.cart).subscribe({
    next: () => {
      this.cart = [];
      this.showPopup = false;
      console.log('Cart cleared successfully from backend!');
    },
    error: (err: any) => console.error('Error clearing cart:', err),
    complete: () => console.log('All delete requests processed'),
  });
}

track(index: number, product: any): any {
  return product.id;
}
  */

/*
  updateCart(
    productId: string,
    quantityInCart: number,
    operation: 'increase' | 'decrease'
  ) {
    if (this.token && productId) {
      this.cartService.updateCart(productId, quantityInCart, this.token);

      const quantityChange = operation === 'increase' ? -1 : 1;
      this.productService
        .updateProductQuantity(productId, quantityChange, operation, this.token)
        .subscribe({
          next: (response: any) => {
            console.log(this.cart);
          },

          error: (error: any) => {
            this.toastr.error(
              'An error occurred while updating the quantity in stock',
              'error'
            );
          },
        });
    }
  }
*/
