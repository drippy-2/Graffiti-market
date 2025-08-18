import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductSlide {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
}

const sampleProducts: ProductSlide[][] = [
  [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Electronics",
      price: "$299",
      category: "tech",
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Fashion",
      price: "$89",
      category: "clothing",
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Home & Living",
      price: "$159",
      category: "home",
    },
    {
      id: "4",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Groceries",
      price: "$29",
      category: "food",
    },
  ],
  [
    {
      id: "5",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Sports & Fitness",
      price: "$199",
      category: "sports",
    },
    {
      id: "6",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Books & Media",
      price: "$39",
      category: "books",
    },
    {
      id: "7",
      image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Toys & Games",
      price: "$49",
      category: "toys",
    },
    {
      id: "8",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Jewelry",
      price: "$129",
      category: "jewelry",
    },
  ],
];

export default function ProductSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = sampleProducts.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl p-6 shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-6" data-testid="text-featured-products">
          Featured Products
        </h3>

        {/* Product Slider Container */}
        <div className="relative overflow-hidden rounded-xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            data-testid="slider-container"
          >
            {sampleProducts.map((slide, slideIndex) => (
              <div key={slideIndex} className="min-w-full">
                <div className="grid grid-cols-2 gap-4">
                  {slide.map((product) => (
                    <div
                      key={product.id}
                      className="product-slide bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
                      data-testid={`product-card-${product.id}`}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-32 object-cover rounded-md mb-3"
                        data-testid={`img-product-${product.id}`}
                      />
                      <h4 className="font-semibold text-gray-800" data-testid={`text-product-name-${product.id}`}>
                        {product.title}
                      </h4>
                      <p className="text-graffiti-orange font-bold" data-testid={`text-product-price-${product.id}`}>
                        {product.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={previousSlide}
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={nextSlide}
            data-testid="button-next-slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Slider Dots */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-graffiti-orange" : "bg-gray-300"
                }`}
                onClick={() => setCurrentSlide(index)}
                data-testid={`button-slide-dot-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
