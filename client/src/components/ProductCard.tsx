import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, StarHalf, ShoppingCart, Eye, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  reviews?: any[];
  sellerId: string;
  createdAt: string;
}

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  onAddToCart: (productId: string) => void;
  canAddToCart: boolean;
}

export default function ProductCard({ product, viewMode, onAddToCart, canAddToCart }: ProductCardProps) {
  const averageRating = product.reviews?.length 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-shadow" data-testid={`product-card-${product.id}`}>
        <CardContent className="p-6">
          <div className="flex space-x-6">
            {/* Product Image */}
            <div className="flex-shrink-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-lg"
                  data-testid={`img-product-${product.id}`}
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${product.id}`}>
                      {product.category}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
                    {product.description}
                  </p>

                  <div className="flex items-center space-x-4 mb-3">
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="flex">{renderStars(averageRating)}</div>
                        <span className="text-sm text-gray-600">
                          ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    )}
                    <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid={`text-stock-${product.id}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-graffiti-orange" data-testid={`text-price-${product.id}`}>
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" data-testid={`button-view-${product.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {canAddToCart && (
                      <Button
                        size="sm"
                        className="bg-graffiti-orange hover:bg-orange-600 text-white"
                        onClick={() => onAddToCart(product.id)}
                        disabled={product.stock === 0}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105" data-testid={`product-card-${product.id}`}>
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative mb-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
              data-testid={`img-product-${product.id}`}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Stock Badge */}
          {product.stock === 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${product.id}`}>
              {product.category}
            </Badge>
            <span className="text-xs text-gray-500" data-testid={`text-stock-${product.id}`}>
              {product.stock} left
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]" data-testid={`text-product-description-${product.id}`}>
            {product.description}
          </p>

          {/* Ratings */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="flex">{renderStars(averageRating)}</div>
              <span className="text-sm text-gray-600">
                ({product.reviews.length})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-graffiti-orange" data-testid={`text-price-${product.id}`}>
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${product.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {canAddToCart && (
              <Button
                size="sm"
                className="flex-1 bg-graffiti-orange hover:bg-orange-600 text-white"
                onClick={() => onAddToCart(product.id)}
                disabled={product.stock === 0}
                data-testid={`button-add-to-cart-${product.id}`}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
