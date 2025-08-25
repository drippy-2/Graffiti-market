import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
  const [, setLocation] = useLocation();

  // filters / state
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(""); // empty string = all
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);

  // load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get("search") || "");
    setCategory(params.get("category") || "");
    setSortBy(params.get("sort") || "name");
    setPage(parseInt(params.get("page") || "1", 10));
  }, []);

  // helper to sync URL
  const syncUrl = (next: {
    search?: string;
    category?: string;
    sort?: string;
    page?: number;
  } = {}) => {
    const params = new URLSearchParams();
    const s = next.search ?? searchTerm;
    const c = next.category ?? category;
    const so = next.sort ?? sortBy;
    const p = next.page ?? page;

    if (s) params.set("search", s);
    if (c) params.set("category", c);
    if (so) params.set("sort", so);
    if (p > 1) params.set("page", String(p));

    setLocation(`/products?${params.toString()}`);
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    syncUrl({ page: 1 });
  };

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, sortBy]);

  // products query
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    error: productsError,
  } = useQuery({
    queryKey: ["/api/products", { page, search: searchTerm, category, sort: sortBy }],
    queryFn: () =>
      api.getProducts({
        page,
        per_page: 20,
        search: searchTerm || undefined,
        category: category || undefined,
        sort: sortBy,
      }),
    keepPreviousData: true,
  });

  // categories query (returns { categories: string[] })
  const {
    data: categoriesResp,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["/api/products/categories"],
    queryFn: () => api.getCategories(),
  });

  const categories = categoriesResp?.categories ?? [];
  const products = productsData?.products ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* Search & filters */}
      <form onSubmit={onSubmitSearch} className="flex flex-col gap-4 md:flex-row md:items-end mb-6">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search products
          </label>
          <Input
            id="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category filter (no empty string item) */}
        <Select
          value={category || "__all__"}
          onValueChange={(val) => {
            const next = val === "__all__" ? "" : val;
            setCategory(next);
            setPage(1);
            syncUrl({ category: next, page: 1 });
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categoriesLoading && <SelectItem value="__loading__" disabled>Loading…</SelectItem>}
            {categoriesError && <SelectItem value="__error__" disabled>Error loading</SelectItem>}
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(val) => {
            setSortBy(val);
            setPage(1);
            syncUrl({ sort: val, page: 1 });
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" disabled={productsLoading}>
          {productsLoading ? "Searching…" : "Search"}
        </Button>
      </form>

      {/* Status / errors */}
      {productsError && (
        <p className="text-sm text-red-600 mb-4">Failed to load products.</p>
      )}
      {productsFetching && (
        <p className="text-sm text-gray-500 mb-2">Updating…</p>
      )}

      {/* Grid */}
      {productsLoading && !productsFetching ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-gray-600">No products found.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setCategory("");
              setSortBy("name");
              setPage(1);
              syncUrl({ search: "", category: "", sort: "name", page: 1 });
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-600">
            Showing {products.length} of {productsData?.total ?? 0}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {productsData && productsData.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => {
              const next = Math.max(1, page - 1);
              setPage(next);
              syncUrl({ page: next });
            }}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {productsData.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              const next = Math.min(productsData.pages, page + 1);
              setPage(next);
              syncUrl({ page: next });
            }}
            disabled={page === productsData.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
