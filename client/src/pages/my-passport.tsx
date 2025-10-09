import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StampCard from "@/components/stamp-card";
import BadgeCard from "@/components/badge-card";
import type { UserPassport } from "@shared/schema";

export default function MyPassport() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  // TODO: Get actual user ID from auth context
  const userId = "user-1";
  
  const { data: userPassport, isLoading } = useQuery<UserPassport>({
    queryKey: ["/api/users", userId, "passport"],
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ["/api/badges"],
  });

  const filterOptions = [
    { value: "all", label: "All Stamps" },
    { value: "region", label: "By Region" },
    { value: "craft", label: "By Craft" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="w-64 h-12 mb-8" />
          
          {/* Profile Card Skeleton */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="w-48 h-8" />
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-24 h-6" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-12 h-12" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
          </div>

          {/* Impact Summary Skeleton */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="w-8 h-8 mb-3" />
                <Skeleton className="w-16 h-8 mb-1" />
                <Skeleton className="w-20 h-4" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userPassport) {
    return (
      <div className="min-h-screen p-8 bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-passport text-6xl text-muted-foreground mb-4"></i>
          <h2 className="font-serif text-2xl font-bold mb-2">No Passport Found</h2>
          <p className="text-muted-foreground mb-4">
            Start your journey by scanning your first garment!
          </p>
          <Button>Scan Garment</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="font-serif text-5xl font-bold mb-2" data-testid="passport-title">
            My Passport
          </h1>
          <p className="text-muted-foreground text-lg">
            Your cultural journey and impact story
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 mb-8 text-white shadow-xl" data-testid="user-profile-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" 
                alt="User profile" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                data-testid="user-avatar"
              />
              <div>
                <h2 className="text-3xl font-bold mb-1" data-testid="user-name">
                  {userPassport.user.name || "Sarah Martinez"}
                </h2>
                <p className="text-white/90 mb-2">
                  Member since {new Date(userPassport.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white backdrop-blur-sm capitalize">
                    <i className="fas fa-crown mr-1"></i>
                    {userPassport.user.membershipTier} Member
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Total Impact</p>
              <p className="text-5xl font-bold metric-counter" data-testid="total-stamps">
                {userPassport.stamps.length}
              </p>
              <p className="text-white/80 text-sm">Stamps Collected</p>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8" data-testid="impact-summary">
          <Card className="p-6 shadow-sm">
            <i className="fas fa-water text-secondary text-3xl mb-3"></i>
            <p className="metric-counter text-3xl font-bold mb-1" data-testid="water-saved">
              {userPassport.totalImpact.waterSaved.toLocaleString()}L
            </p>
            <p className="text-sm text-muted-foreground">Water Saved</p>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <i className="fas fa-seedling text-secondary text-3xl mb-3"></i>
            <p className="metric-counter text-3xl font-bold mb-1" data-testid="co2-offset">
              {userPassport.totalImpact.co2Offset.toFixed(1)}kg
            </p>
            <p className="text-sm text-muted-foreground">CO₂ Offset</p>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <i className="fas fa-users text-accent text-3xl mb-3"></i>
            <p className="metric-counter text-3xl font-bold mb-1" data-testid="artisans-supported">
              {userPassport.totalImpact.artisansSupported}
            </p>
            <p className="text-sm text-muted-foreground">Artisans Supported</p>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <i className="fas fa-globe-americas text-primary text-3xl mb-3"></i>
            <p className="metric-counter text-3xl font-bold mb-1" data-testid="countries-explored">
              {userPassport.totalImpact.countriesExplored}
            </p>
            <p className="text-sm text-muted-foreground">Countries Explored</p>
          </Card>
        </div>

        {/* Badges Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl font-bold">Badges Earned</h2>
            <span className="text-sm text-muted-foreground" data-testid="badge-progress">
              {userPassport.badges.length} of {allBadges.length} unlocked
            </span>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6" data-testid="badges-grid">
            {allBadges.map((badge) => {
              const userBadge = userPassport.badges.find(ub => ub.badgeId === badge.id);
              return (
                <BadgeCard 
                  key={badge.id} 
                  badge={badge} 
                  isUnlocked={!!userBadge}
                  earnedAt={userBadge?.earnedAt}
                />
              );
            })}
          </div>
        </div>

        {/* Stamp Collection */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl font-bold">My Stamp Collection</h2>
            <div className="flex gap-3">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilter === option.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveFilter(option.value)}
                  data-testid={`filter-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          {userPassport.stamps.length === 0 ? (
            <div className="text-center py-12" data-testid="no-stamps">
              <i className="fas fa-stamp text-6xl text-muted-foreground mb-4"></i>
              <h3 className="font-serif text-2xl font-bold mb-2">No Stamps Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your collection by scanning your first garment!
              </p>
              <Button>Scan Garment</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6" data-testid="stamps-grid">
              {userPassport.stamps.map((stamp) => (
                <StampCard 
                  key={stamp.id} 
                  stamp={stamp}
                  garment={stamp.garment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
