import { Component, OnInit } from '@angular/core';
import { HoverDirective } from '../../../directives/hover.directive';
import { Product } from '../../../models/product.model';
import { ProductsService } from '../../../services/products.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartsService } from '../../../services/carts.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-features',
  imports: [HoverDirective, CommonModule, RouterModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent implements OnInit {
  products: Product[] = [];
  topRatedProducts: Product[] = [];
  token: string | null = localStorage.getItem('token');
  page: number = 0;
  limit: number = 9;

  constructor(
    private productService: ProductsService,
    private cartsService: CartsService,
    private route: ActivatedRoute,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParamMap;

    this.productService
      .getAllProducts(queryParams, this.page, this.limit)
      .subscribe({
        next: (res: any) => {
          this.products = res.data;
          this.topRatedProducts = [...this.products]
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 3);
        },
      });
  }

  handleAddToCart(productId: string, event: Event) {
    event.stopPropagation();
    if (this.token) {
      this.cartsService.addToCart(productId, this.token);
    } else {
      this.toaster.success('Failed to add product to cart', 'Error');
    }
  }
}
