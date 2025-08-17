import { Component, HostListener } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../models/product.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Wishlist } from '../../../models/wishlist.model';
import { WishlistService } from '../../../services/wishlist.service';
import { LoadingService } from '../../../services/loading.service';
import { CartsService } from '../../../services/carts.service';
import { Cart } from '../../../models/cart.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [ProductCardComponent, CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  constructor(
    private productService: ProductsService,
    private wishlistService: WishlistService,
    public loadingService: LoadingService,
    private cartService: CartsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  data: Array<Product> = [];
  wishlist: Wishlist = {};
  cartData: Cart = {};
  totalProducts: number = 0;
  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 9;

  ngOnInit() {
    this.setPageSizeByScreenWidth();
    this.wishlistService.wishlist$.subscribe({
      next: newWishlist => {
        this.wishlist = newWishlist;
      },
    });

    this.cartService.cart$.subscribe({
      next: data => {
        this.cartData = data;
      },
      error: err => {
        console.log(err);
      },
    });

    this.route.queryParamMap.subscribe(params => {
      this.currentPage = Number(params.get('page')) || 1;
      this.fetchProducts(params, this.currentPage, this.pageSize);
    });
  }

  fetchProducts(query: ParamMap, page: number, limit: number) {
    this.loadingService.show();
    this.productService.getAllProducts(query, page, limit).subscribe({
      next: (res: any) => {
        this.data = res.data;
        this.totalProducts = res.total;
        this.totalPages = res.totalPages;
        this.currentPage = res.page;
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
      },
      complete: () => {},
    });
  }

  onPageChange(newPage: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.route.snapshot.queryParams, page: newPage },
      queryParamsHandling: 'merge',
    });
  }

  @HostListener('window:resize')
  onResize() {
    const prevPageSize = this.pageSize;
    this.setPageSizeByScreenWidth();

    if (prevPageSize !== this.pageSize) {
      this.fetchProducts(
        this.route.snapshot.queryParamMap,
        this.currentPage,
        this.pageSize
      );
    }
  }

  private setPageSizeByScreenWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      this.pageSize = 3;
    } else {
      this.pageSize = 9;
    }
  }

  getRangeStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getRangeEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalProducts ? this.totalProducts : end;
  }
}

/*

    // this.router.events.subscribe(() => {
    //   this.loadingService.show();
    //   const queryString = this.router.url.split('?')[1] || '';
    // });
*/
