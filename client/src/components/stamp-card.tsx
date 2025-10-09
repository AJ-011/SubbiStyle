import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Stamp, GarmentWithDetails } from "@shared/schema";

interface StampCardProps {
  stamp: Stamp;
  garment: GarmentWithDetails;
}

export default function StampCard({ stamp, garment }: StampCardProps) {
  return (
    <Card 
      className="stamp-card cursor-pointer scrapbook-corner transition-all hover:border-primary hover:shadow-lg"
      data-testid={`stamp-card-${stamp.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-stamp text-primary text-xl"></i>
            </div>
            <div>
              <p className="font-semibold" data-testid={`stamp-name-${stamp.id}`}>
                {garment.name}
              </p>
              <p className="text-xs text-muted-foreground">{garment.origin}</p>
            </div>
          </div>
          <Badge className="bg-secondary/20 text-secondary text-xs">
            Unlocked
          </Badge>
        </div>
        
        {/* Garment Thumbnail */}
        <img 
          src={garment.images?.[0] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={garment.name}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
        
        {/* Impact Preview */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {garment.impactMetrics?.waterSaved && (
            <div className="text-center p-2 bg-background/50 rounded text-xs">
              <i className="fas fa-water text-secondary"></i>
              <p className="metric-counter mt-1">{garment.impactMetrics.waterSaved}L</p>
            </div>
          )}
          
          {garment.impactMetrics?.artisansSupported && (
            <div className="text-center p-2 bg-background/50 rounded text-xs">
              <i className="fas fa-users text-accent"></i>
              <p className="mt-1">{garment.impactMetrics.artisansSupported} artisans</p>
            </div>
          )}
          
          <div className="text-center p-2 bg-background/50 rounded text-xs">
            <i className="fas fa-book text-primary"></i>
            <p className="mt-1">{garment.culturalContent?.length || 0} stories</p>
          </div>
        </div>
        
        {/* Unlock Date */}
        <div className="text-xs text-muted-foreground mb-3">
          Unlocked {stamp.unlockedAt ? new Date(stamp.unlockedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }) : 'Recently'}
        </div>
        
        <Link href={`/passport/${garment.id}`}>
          <Button 
            className="w-full bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary transition-all"
            data-testid={`button-view-passport-${stamp.id}`}
          >
            View Passport
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
