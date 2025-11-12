import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import type { GarmentWithDetails, UserPassport } from "@shared/schema";

export default function PassportDetail() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/passport/:garmentId");
  const userId = user?.id;
  const garmentId = params?.garmentId;
  const queryClient = useQueryClient();

  const { data: garment, isLoading } = useQuery<GarmentWithDetails>({
    queryKey: ["/api/garments", garmentId],
    enabled: !!garmentId,
  });

  const { data: userPassport } = useQuery<UserPassport | null>({
    queryKey: ["/api/users", userId, "passport"],
    enabled: !!userId,
  });

  const { mutate: trackAnalytics } = useMutation({
    mutationFn: async (data: { action: string; metadata?: any }) => {
      if (!user || !garmentId) {
        return null;
      }

      return apiRequest("POST", "/api/analytics", {
        garmentId,
        action: data.action,
        metadata: data.metadata,
      });
    },
    onSuccess: () => {
      if (user && garmentId) {
        queryClient.invalidateQueries({ queryKey: ["/api/garments", garmentId, "analytics"] });
      }
    },
  });

  const hasPurchased = Boolean(
    user && userPassport?.stamps.some((stamp) => stamp.garment.id === garmentId)
  );

  const handlePurchaseClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // TODO: Integrate checkout flow
    navigate('/shop');
  };

const renderProtected = (content: ReactNode) => {
    if (hasPurchased) {
      return content;
    }

    const message = user
      ? "Purchase to unlock stamp"
      : "Sign in to unlock passport";

    return (
      <div className="relative">
        <div className="pointer-events-none select-none filter blur-sm opacity-60">
          {content}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="bg-background/95 border border-primary px-6 py-3 rounded-full text-primary font-semibold shadow-lg">
            {message}
          </div>
          {user ? (
            <Button className="px-6" onClick={() => navigate('/shop')}>
              Browse Garments
            </Button>
          ) : (
            <Button className="px-6" onClick={() => navigate('/auth')}>
              Log In / Sign Up
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleTabChange = (section: string) => {
    if (!user || !garmentId) {
      return;
    }

    trackAnalytics({ 
      action: `view_${section}`,
      metadata: { section }
    });
  };

    if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-background">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="w-24 h-6 mb-6" />
          <Card className="p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="w-full h-96 rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="w-32 h-8" />
                <Skeleton className="w-full h-8" />
                <Skeleton className="w-3/4 h-6" />
                <div className="space-y-2">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-2/3 h-4" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!garment) {
    return (
      <div className="min-h-screen p-8 bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-muted-foreground mb-4"></i>
          <h2 className="font-serif text-2xl font-bold mb-2">Garment Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The garment you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/shop">
          <Button 
            variant="ghost" 
            className="mb-6 text-muted-foreground hover:text-foreground"
            data-testid="button-back-to-shop"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Shop
          </Button>
        </Link>

        {/* Passport Header */}
        <Card className="border-2 border-primary rounded-2xl p-8 mb-8 stamp-texture" data-testid="passport-header">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src={garment.images?.[0] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"} 
                alt={garment.name}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold mb-3" data-testid="passport-title">
                {garment.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {garment.description}
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3">
                  <i className="fas fa-map-marker-alt text-primary w-5"></i>
                  <span data-testid="passport-origin">{garment.origin}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-user text-primary w-5"></i>
                  <span data-testid="passport-artisan">Artisan: {garment.artisan.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-calendar text-primary w-5"></i>
                  <span>Crafted: {garment.createdAt ? new Date(garment.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}</span>
                </div>
              </div>
              

              <div className="flex flex-col gap-2 mb-6">
                <span className="text-3xl font-serif font-bold" data-testid="passport-price">${Number(garment.price).toFixed(2)}</span>
                <Button className="px-8" data-testid="button-purchase" onClick={handlePurchaseClick}>
                  {user ? "Purchase" : "Log In to Purchase"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Three Section Tabs */}
        <Card className="overflow-hidden shadow-lg">
          <Tabs defaultValue="impact" onValueChange={handleTabChange}>
            <TabsList className="w-full bg-muted/10 border-b border-border">
              <TabsTrigger value="impact" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <i className="fas fa-leaf mr-2"></i>
                Impact
              </TabsTrigger>
              <TabsTrigger value="care" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <i className="fas fa-hands-wash mr-2"></i>
                Care
              </TabsTrigger>
              <TabsTrigger value="culture" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <i className="fas fa-book-open mr-2"></i>
                Culture
              </TabsTrigger>
            </TabsList>

            <TabsContent value="impact" className="p-8" data-testid="tab-impact">
              {renderProtected(
                <>
                  <h2 className="font-serif text-3xl font-bold mb-6">Environmental & Social Impact</h2>
                  
                  {garment.impactMetrics ? (
                    <>
                      {/* Impact Metrics */}
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-secondary/10 rounded-xl p-6 text-center border border-secondary/20">
                          <i className="fas fa-water text-secondary text-4xl mb-3"></i>
                          <p className="metric-counter text-4xl font-bold text-secondary mb-2">
                            {garment.impactMetrics.waterSaved}L
                          </p>
                          <p className="text-sm text-muted-foreground">Water Saved</p>
                          <p className="text-xs text-muted-foreground mt-1">vs conventional methods</p>
                        </div>
                        
                        <div className="bg-secondary/10 rounded-xl p-6 text-center border border-secondary/20">
                          <i className="fas fa-cloud text-secondary text-4xl mb-3"></i>
                          <p className="metric-counter text-4xl font-bold text-secondary mb-2">
                            {garment.impactMetrics.co2Offset}kg
                          </p>
                          <p className="text-sm text-muted-foreground">CO₂ Offset</p>
                          <p className="text-xs text-muted-foreground mt-1">carbon neutral production</p>
                        </div>
                        
                        <div className="bg-accent/10 rounded-xl p-6 text-center border border-accent/20">
                          <i className="fas fa-users text-accent text-4xl mb-3"></i>
                          <p className="metric-counter text-4xl font-bold text-accent mb-2">
                            {garment.impactMetrics.artisansSupported}
                          </p>
                          <p className="text-sm text-muted-foreground">Artisans Supported</p>
                          <p className="text-xs text-muted-foreground mt-1">fair wage employment</p>
                        </div>
                      </div>

                      {/* Supply Chain */}
                      {garment.impactMetrics.supplyChainSteps && garment.impactMetrics.supplyChainSteps.length > 0 && (
                        <div className="bg-background/50 rounded-xl p-6 border border-border">
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <i className="fas fa-route text-primary"></i>
                            Supply Chain Journey
                          </h3>
                          
                          <div className="space-y-4">
                            {garment.impactMetrics.supplyChainSteps.map((step, index) => (
                              <div key={index} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                                    {step.step}
                                  </div>
                                  {index < garment.impactMetrics!.supplyChainSteps!.length - 1 && (
                                    <div className="w-0.5 h-full bg-border mt-2"></div>
                                  )}
                                </div>
                                <div className="pb-6">
                                  <p className="font-medium">{step.title}</p>
                                  <p className="text-sm text-muted-foreground">{step.location} • {step.date}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <i className="fas fa-leaf text-6xl mb-4"></i>
                      <p>Impact metrics not available for this garment</p>
                    </div>
                  )}

                  {/* Artisan Profile */}
                  <div className="bg-accent/10 rounded-xl p-6 border border-accent/20 mt-8">
                    <h3 className="font-semibold text-lg mb-4">Meet the Artisan</h3>
                    <div className="flex gap-4">
                      <img 
                        src={garment.artisan.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
                        alt={garment.artisan.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-lg">{garment.artisan.name}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {garment.artisan.craft}
                          {garment.artisan.generation && ` • ${garment.artisan.generation}th Generation`}
                        </p>
                        <p className="text-sm">{garment.artisan.bio}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="care" className="p-8" data-testid="tab-care">
              {renderProtected(
                <>
                  <h2 className="font-serif text-3xl font-bold mb-6">Garment Care Instructions</h2>
                  
                  {garment.careInstructions ? (
                    <div className="space-y-6">
                      <div className="bg-background/50 rounded-xl p-6 border border-border">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <i className="fas fa-hands-wash text-primary"></i>
                          Washing Instructions
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {garment.careInstructions.washingInstructions}
                        </p>
                      </div>

                      <div className="bg-background/50 rounded-xl p-6 border border-border">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <i className="fas fa-leaf text-secondary"></i>
                          Materials
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {garment.careInstructions.materials}
                        </p>
                      </div>

                      <div className="bg-background/50 rounded-xl p-6 border border-border">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <i className="fas fa-heart text-accent"></i>
                          Special Care
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {garment.careInstructions.specialCare}
                        </p>
                      </div>

                      <div className="bg-background/50 rounded-xl p-6 border border-border">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <i className="fas fa-tools text-primary"></i>
                          Repair Guidance
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {garment.careInstructions.repairGuidance}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <i className="fas fa-hands-wash text-6xl mb-4"></i>
                      <p>Care instructions not available for this garment</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="culture" className="p-8" data-testid="tab-culture">
              {renderProtected(
                <>
                  <h2 className="font-serif text-3xl font-bold mb-6">Cultural Heritage & Stories</h2>
                  
                  {garment.culturalContent && garment.culturalContent.length > 0 ? (
                    <div className="grid gap-6">
                      {garment.culturalContent.map((content) => (
                        <Card key={content.id} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <i className={`fas fa-${content.type === 'recipe' ? 'utensils' : content.type === 'music' ? 'music' : content.type === 'video' ? 'video' : 'book'} text-primary`}></i>
                              <Badge variant="secondary" className="capitalize">
                                {content.type}
                              </Badge>
                              {content.isAiGenerated && (
                                <Badge variant="outline" className="text-xs">
                                  AI-Enhanced
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-serif text-xl font-bold mb-3">{content.title}</h3>
                            
                            {content.content && (
                              <div className="bg-background/50 rounded-lg p-4 border border-border">
                                <p className="text-sm leading-relaxed whitespace-pre-line">{content.content}</p>
                              </div>
                            )}
                            
                            {content.images && content.images.length > 0 && (
                              <div className="mt-4 grid grid-cols-2 gap-3">
                                {content.images.map((image, index) => (
                                  <img 
                                    key={index}
                                    src={image} 
                                    alt={`${content.title} - ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <i className="fas fa-book-open text-6xl mb-4"></i>
                      <p>Cultural content not available for this garment</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}