import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GarmentCard from "@/components/garment-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { GarmentWithDetails } from "@shared/schema";

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState("featured");

  const { data: garments = [], isLoading } = useQuery<GarmentWithDetails[]>({
    queryKey: ["/api/garments", { search: searchTerm, category: categoryFilter }],
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["/api/brands"],
  });

  const filteredAndSortedGarments = garments
    .filter(garment => {
      const matchesSearch = !searchTerm || 
        garment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garment.origin.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || garment.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number(a.price) - Number(b.price);
        case "price-high":
          return Number(b.price) - Number(a.price);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const categories = [
    { value: "", label: "All Categories" },
    { value: "clothing", label: "Clothing" },
    { value: "accessories", label: "Accessories" },
    { value: "textiles", label: "Textiles" },
    { value: "jewelry", label: "Jewelry" },
  ];

  const filterTags = [
    { label: "All Garments", active: true },
    { label: "Natural Dyes" },
    { label: "Handwoven" },
    { label: "Zero Waste" },
    { label: "Endangered Crafts" },
  ];

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Shop Header */}
        <div className="mb-8">
          <h1 className="font-serif text-5xl font-bold mb-4" data-testid="shop-title">
            Shop Ethical Fashion
          </h1>
          <p className="text-muted-foreground text-lg">
            Every purchase unlocks a digital passport and supports artisan communities worldwide
          </p>
        </div>

        {/* Filters & Search */}
        <Card className="mb-8" data-testid="filters-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                  <Input
                    type="text"
                    placeholder="Search garments, brands, regions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12"
                    data-testid="input-search"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort */}
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort">
                    <SelectValue placeholder="Sort by: Featured" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {filterTags.map((tag, index) => (
                <Button
                  key={index}
                  variant={tag.active ? "default" : "secondary"}
                  size="sm"
                  className={tag.active ? "bg-primary text-primary-foreground" : "bg-muted/30 hover:bg-muted/50"}
                  data-testid={`filter-tag-${tag.label.toLowerCase().replace(' ', '-')}`}
                >
                  {tag.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isLoading ? (
              "Loading garments..."
            ) : (
              `Showing ${filteredAndSortedGarments.length} garments`
            )}
          </p>
        </div>

        {/* Garment Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-80" />
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-16 w-full mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedGarments.length === 0 ? (
          <div className="text-center py-12" data-testid="no-results">
            <i className="fas fa-search text-6xl text-muted-foreground mb-4"></i>
            <h3 className="font-serif text-2xl font-bold mb-2">No garments found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="garments-grid">
            {filteredAndSortedGarments.map((garment) => (
              <GarmentCard key={garment.id} garment={garment} />
            ))}
          </div>
        )}

        {/* Load More */}
        {!isLoading && filteredAndSortedGarments.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              data-testid="button-load-more"
            >
              Load More Garments
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
