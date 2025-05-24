import { auth } from "./stores/auth";
import { get } from "svelte/store";

const API_BASE = "https://claude-sonnet-4-stocktake.onrender.com/api";

class ApiClient {
  private getHeaders(): HeadersInit {
    const authStore = get(auth);
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string, role: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return this.request(`/products${query}`);
  }

  async createProduct(product: any) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  }

  // Warehouses
  async getWarehouses() {
    return this.request("/warehouses");
  }

  async createWarehouse(warehouse: any) {
    return this.request("/warehouses", {
      method: "POST",
      body: JSON.stringify(warehouse),
    });
  }

  // Inventory
  async getInventory(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return this.request(`/inventory${query}`);
  }

  async getInventoryByLocation(productId: string, warehouseId: string) {
    return this.request(`/inventory/${productId}/${warehouseId}`);
  }

  // Stock Movements
  async createStockMovement(movement: any) {
    return this.request("/stock-movements", {
      method: "POST",
      body: JSON.stringify(movement),
    });
  }

  async getStockMovements(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return this.request(`/stock-movements${query}`);
  }

  // Reports
  async getLowStockReport() {
    return this.request("/reports/low-stock");
  }

  async getStockValueReport(warehouse?: string) {
    const query = warehouse ? `?warehouse=${warehouse}` : "";
    return this.request(`/reports/stock-value${query}`);
  }

  async getMovementSummary(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString() ? `?${params}` : "";
    return this.request(`/reports/movement-summary${query}`);
  }

  // Batch Operations
  async importProducts(products: any[]) {
    return this.request("/batch/import-products", {
      method: "POST",
      body: JSON.stringify({ products }),
    });
  }

  async performStockTake(adjustments: any[]) {
    return this.request("/batch/stock-take", {
      method: "POST",
      body: JSON.stringify({ adjustments }),
    });
  }
}

export const api = new ApiClient();
