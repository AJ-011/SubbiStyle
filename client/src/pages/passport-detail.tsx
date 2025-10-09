import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import type { GarmentWithDetails } from "@shared/schema";

export default function PassportDetail() {
  const [, params] = useRoute("/passport/:garmentId");
  const garmentId = params?.garmentId;
  const queryClient = useQueryClient();

  const { data: garment, isLoading } = useQuery<GarmentWithDetails>({
    queryKey: ["/api/garments", garmentId],
    enabled: !!garmentId,
  });

  const { mutate: trackAnalytics } = useMutation({
    mutationFn: async (data: { action: string; metadata?: any }) => {
      return apiRequest("POST", "/api/analytics", {
        garmentId,
        action: data.action,
        metadata: data.metadata,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/garments", garmentId, "analytics"] });
    },
  });

  const { mutate: unlockStamp } = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/stamps", {
        userId: "user-1", // TODO: Get from auth context
        garmentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", "user-1", "passport"] });
    },
  });

  const handleTabChange = (section: string) => {
    trackAnalytics({ 
      action: `view_${section}`,
      metadata: { section }
    });
  };

  const handleUnlockStamp = () => {
    unlockStamp();
    trackAnalytics({ 
      action: "view_passport",
      metadata: { unlocked: true }
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-passport text-primary text-2xl"></i>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Digital Passport</p>
                  <p className="font-mono text-xs text-muted-foreground">#{garment.id}</p>
                </div>
              </div>
              
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
                  <span>Crafted: {new Date(garment.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              
              <div className="bg-background/80 rounded-lg p-4 border border-border mb-6">
                <p className="text-sm font-medium mb-2">NFC/QR Authentication</p>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-secondary"></i>
                  <span className="text-sm">Verified Authentic</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Scanned: {new Date().toLocaleDateString()}
                </p>
              </div>

              <Button 
                onClick={handleUnlockStamp}
                className="w-full"
                data-testid="button-unlock-stamp"
              >
                <i className="fas fa-stamp mr-2"></i>
                Unlock Digital Stamp
              </Button>
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
                    src={garment.artisan.profileImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
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
            </TabsContent>

            <TabsContent value="care" className="p-8" data-testid="tab-care">
              <h2 className="font-serif text-3xl font-bold mb-6">Garment Care Instructions</h2>
              
              {garment.careInstructions ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-background/50 rounded-xl p-6 border border-border">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <i className="fas fa-hands-wash text-primary"></i>
                        Washing Instructions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {garment.careInstructions.washingInstructions || "Hand wash with cold water and mild detergent. Avoid harsh chemicals that could damage natural fibers."}
                      </p>
                    </div>

                    <div className="bg-background/50 rounded-xl p-6 border border-border">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <i className="fas fa-wind text-secondary"></i>
                        Drying Instructions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {garment.careInstructions.dryingInstructions || "Air dry flat away from direct sunlight to preserve colors and prevent shrinkage."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-background/50 rounded-xl p-6 border border-border">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <i className="fas fa-archive text-accent"></i>
                        Storage Tips
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {garment.careInstructions.storageTips || "Store in a cool, dry place with cedar sachets to prevent moth damage. Fold carefully to maintain shape."}
                      </p>
                    </div>

                    <div className="bg-background/50 rounded-xl p-6 border border-border">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <i className="fas fa-tools text-primary"></i>
                        Repair Tips
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {garment.careInstructions.repairTips || "For minor repairs, use matching thread and traditional mending techniques. Contact us for major restoration services."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <i className="fas fa-hands-wash text-6xl mb-4"></i>
                  <p>Care instructions not available for this garment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="culture" className="p-8" data-testid="tab-culture">
              <h2 className="font-serif text-3xl font-bold mb-6">Cultural Heritage & Stories</h2>
              
              {garment.culturalContent && garment.culturalContent.length > 0 ? (
                <div className="grid gap-6">
                  {garment.culturalContent.map((content) => (
                    <Card key={content.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <i className={`fas fa-${content.contentType === 'recipe' ? 'utensils' : content.contentType === 'music' ? 'music' : content.contentType === 'video' ? 'video' : 'book'} text-primary`}></i>
                          <Badge variant="secondary" className="capitalize">
                            {content.contentType}
                          </Badge>
                          {content.isAiGenerated && (
                            <Badge variant="outline" className="text-xs">
                              AI-Enhanced
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-serif text-xl font-bold mb-3">{content.title}</h3>
                        <p className="text-muted-foreground mb-4">{content.description}</p>
                        
                        {content.content && (
                          <div className="bg-background/50 rounded-lg p-4 border border-border">
                            {content.contentType === 'recipe' && content.content.ingredients && (
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Ingredients:</h4>
                                  <ul className="text-sm space-y-1">
                                    {content.content.ingredients.map((ingredient: string, index: number) => (
                                      <li key={index}>• {ingredient}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Instructions:</h4>
                                  <ol className="text-sm space-y-1">
                                    {content.content.instructions?.map((instruction: string, index: number) => (
                                      <li key={index}>{index + 1}. {instruction}</li>
                                    ))}
                                  </ol>
                                </div>
                              </div>
                            )}
                            
                            {content.contentType === 'vocabulary' && content.content.vocabulary && (
                              <div className="space-y-3">
                                {content.content.vocabulary.map((item: any, index: number) => (
                                  <div key={index} className="border-b border-border/50 pb-2 last:border-b-0">
                                    <p className="font-semibold">{item.word}</p>
                                    <p className="text-sm text-muted-foreground">{item.definition}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {content.content.text && (
                              <p className="text-sm whitespace-pre-line">{content.content.text}</p>
                            )}
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
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
