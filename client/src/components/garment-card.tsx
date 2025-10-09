import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GarmentWithDetails } from "@shared/schema";

interface GarmentCardProps {
  garment: GarmentWithDetails;
}

export default function GarmentCard({ garment }: GarmentCardProps) {
  return (
    <Link href={`/passport/${garment.id}`}>
      <Card 
        className="editorial-card cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
        data-testid={`garment-card-${garment.id}`}
      >
        <div className="relative">
          <img 
            src={garment.images?.[0] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"} 
            alt={garment.name}
            className="w-full h-80 object-cover"
          />
          {garment.isVerified && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-secondary text-secondary-foreground">
                Verified
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {garment.origin}
            </span>
            <div className="flex items-center gap-1">
              <i className="fas fa-star text-accent text-xs"></i>
              <span className="text-xs font-medium">4.9</span>
            </div>
          </div>
          
          <h3 className="font-serif text-xl font-bold mb-2" data-testid={`garment-name-${garment.id}`}>
            {garment.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {garment.description}
          </p>
          
          {/* Impact Preview */}
          <div className="bg-background/50 rounded-lg p-3 mb-3 border border-border/50">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {garment.impactMetrics && (
                <>
                  <div>
                    <i className="fas fa-water text-secondary"></i>
                    <span className="ml-1 metric-counter">
                      {garment.impactMetrics.waterSaved}L
                    </span>
                  </div>
                  <div>
                    <i className="fas fa-seedling text-secondary"></i>
                    <span className="ml-1">Organic</span>
                  </div>
                  <div>
                    <i className="fas fa-users text-accent"></i>
                    <span className="ml-1">
                      {garment.impactMetrics.artisansSupported} Artisans
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <span className="font-serif text-2xl font-bold" data-testid={`garment-price-${garment.id}`}>
              ${garment.price}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
