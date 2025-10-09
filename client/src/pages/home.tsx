import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: featuredGarments, isLoading: garmentsLoading } = useQuery({
    queryKey: ["/api/garments"],
  });

  return (
    <div className="min-h-screen p-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="relative h-[500px] rounded-2xl overflow-hidden editorial-card">
          <img 
            src="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1000" 
            alt="Artisan workspace with handwoven textiles" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent flex items-center">
            <div className="text-white p-12 max-w-2xl">
              <h1 className="font-serif text-6xl font-bold mb-4 leading-tight" data-testid="hero-title">
                Every Thread Tells a Story
              </h1>
              <p className="text-xl mb-6 leading-relaxed" data-testid="hero-description">
                Discover the artisans, cultures, and sustainable practices behind your garments through digital passports.
              </p>
              <Link href="/shop">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg shadow-lg hover:shadow-xl"
                  data-testid="button-explore-collections"
                >
                  Explore Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight Section */}
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-4xl font-bold mb-8 text-foreground" data-testid="spotlight-title">
          Spotlight
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sustainability News Feature */}
          <Card className="editorial-card cursor-pointer overflow-hidden" data-testid="news-feature">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Sustainable fashion workshop" 
                className="w-full h-64 object-cover"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                  SUSTAINABILITY NEWS
                </Badge>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">
                The Revival of Natural Dyes in Modern Fashion
              </h3>
              <p className="text-muted-foreground mb-4">
                Indigenous artisans in Peru are bringing ancient dyeing techniques back to life, creating vibrant colors from plants, minerals, and insects while preserving cultural heritage...
              </p>
              <Button variant="link" className="p-0 text-primary font-medium">
                Read More <i className="fas fa-arrow-right text-sm ml-2"></i>
              </Button>
            </CardContent>
          </Card>

          {/* Stamp Preview Feature */}
          <Card className="editorial-card cursor-pointer stamp-texture" data-testid="stamp-preview">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                  STAMP PREVIEW
                </Badge>
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">
                Oaxacan Weaving Traditions
              </h3>
              
              {/* Stamp Visual */}
              <div className="stamp-card rounded-xl p-6 mb-4 scrapbook-corner">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-stamp text-primary text-xl"></i>
                    </div>
                    <div>
                      <p className="font-semibold">Zapotec Weave</p>
                      <p className="text-xs text-muted-foreground">Origin: Oaxaca, Mexico</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Stamp #47</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <i className="fas fa-leaf text-secondary text-xl mb-2"></i>
                    <p className="text-xs font-medium">Impact</p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <i className="fas fa-hands-wash text-primary text-xl mb-2"></i>
                    <p className="text-xs font-medium">Care</p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <i className="fas fa-book-open text-accent text-xl mb-2"></i>
                    <p className="text-xs font-medium">Culture</p>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4">
                Experience the 2,500-year-old tradition of Zapotec weaving through stories, recipes, and music from artisan María Elena...
              </p>
              <Button variant="link" className="p-0 text-primary font-medium">
                Unlock Full Passport <i className="fas fa-unlock text-sm ml-2"></i>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Garment & Collection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Garment */}
          <Card className="lg:col-span-2 editorial-card cursor-pointer overflow-hidden" data-testid="featured-garment">
            <div className="grid md:grid-cols-2">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=900" 
                alt="Hand-embroidered traditional garment" 
                className="w-full h-full object-cover"
              />
              <CardContent className="p-8 flex flex-col justify-between">
                <div>
                  <Badge className="bg-primary/20 text-primary">FEATURED GARMENT</Badge>
                  <h3 className="font-serif text-3xl font-bold mt-4 mb-3">
                    Handwoven Rebozo Shawl
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Traditional Mexican shawl handwoven by master artisan Esperanza Torres using ancestral techniques passed down through 7 generations.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                      <span>Tenancingo, Mexico</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fas fa-leaf text-secondary"></i>
                      <span>Natural cotton & plant dyes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fas fa-water text-secondary"></i>
                      <span className="metric-counter">340L water saved</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl font-bold">$189</span>
                  <Button>View Details</Button>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Featured Collection */}
          <Card className="editorial-card cursor-pointer overflow-hidden" data-testid="featured-collection">
            <img 
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Collection of traditional textiles" 
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-6">
              <Badge className="bg-accent/20 text-accent-foreground">NEW COLLECTION</Badge>
              <h3 className="font-serif text-2xl font-bold mt-3 mb-2">Andean Heritage</h3>
              <p className="text-muted-foreground text-sm mb-4">
                12 pieces celebrating Peruvian textile traditions
              </p>
              
              <div className="flex gap-2 mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" 
                  alt="Andean textile pattern" 
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" 
                  alt="Alpaca wool garment" 
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" 
                  alt="Indigenous weaving technique" 
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                data-testid="button-explore-collection"
              >
                Explore Collection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
