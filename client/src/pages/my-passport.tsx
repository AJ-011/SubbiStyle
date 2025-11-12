import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StampCard from "@/components/stamp-card";
import BadgeCard from "@/components/badge-card";
import type { UserPassport, Badge as BadgeType } from "@shared/schema";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const visitedFillColor = "#DC2626";

const originIsoMappings: Array<[string, string]> = [
  ["Guatemala", "GTM"],
  ["Morocco", "MAR"],
  ["India", "IND"],
  ["Japan", "JPN"],
  ["Peru", "PER"],
  ["Mexico", "MEX"],
  ["United States", "USA"],
  ["USA", "USA"],
  ["Canada", "CAN"],
  ["United Kingdom", "GBR"],
  ["South Korea", "KOR"],
  ["Republic of Korea", "KOR"],
  ["North Korea", "PRK"],
  ["Democratic People's Republic of Korea", "PRK"],
  ["Cote d'Ivoire", "CIV"],
  ["Côte d'Ivoire", "CIV"],
  ["Ivory Coast", "CIV"],
  ["Cape Verde", "CPV"],
  ["Cabo Verde", "CPV"],
  ["Democratic Republic of the Congo", "COD"],
  ["Republic of the Congo", "COG"],
  ["Myanmar", "MMR"],
  ["Lao PDR", "LAO"],
  ["Laos", "LAO"],
  ["Syrian Arab Republic", "SYR"],
  ["Syria", "SYR"],
  ["Venezuela", "VEN"],
  ["Bolivarian Republic of Venezuela", "VEN"],
];

const normalizeCountryKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/gi, "")
    .toLowerCase();

const isoByNormalizedName = originIsoMappings.reduce<Record<string, string>>(
  (acc, [name, iso]) => {
    acc[normalizeCountryKey(name)] = iso.toUpperCase();
    return acc;
  },
  {},
);

export default function MyPassport() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const userId = user?.id;

  console.log("MyPassport - authLoading:", authLoading, "user:", user?.id, "userId:", userId);

  const { data: userPassport, isLoading } = useQuery<UserPassport | null>({
    queryKey: ["/api/users", userId, "passport"],
    enabled: !!userId,
  });

  const { data: allBadges = [] } = useQuery<BadgeType[]>({
    queryKey: ["/api/badges"],
  });

  console.log("MyPassport - isLoading:", isLoading, "userPassport:", userPassport);

  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const { visitedIsoSet, visitedDisplayNames } = useMemo(() => {
    if (!userPassport) {
      return {
        visitedIsoSet: new Set<string>(),
        visitedDisplayNames: [] as string[],
      };
    }

    const isoSet = new Set<string>();
    const displayNames: string[] = [];

    userPassport.stamps.forEach((stamp) => {
      const origin = stamp.garment.origin?.trim();
      if (!origin) {
        return;
      }

      const normalizedKey = normalizeCountryKey(origin);
      const iso = isoByNormalizedName[normalizedKey];
      if (!iso) {
        return;
      }

      const uppercaseIso = iso.toUpperCase();
      if (isoSet.has(uppercaseIso)) {
        return;
      }

      isoSet.add(uppercaseIso);
      displayNames.push(origin);
    });

    return {
      visitedIsoSet: isoSet,
      visitedDisplayNames: displayNames,
    };
  }, [userPassport]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen p-8 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <i className="fas fa-passport text-6xl text-muted-foreground"></i>
          <h2 className="font-serif text-3xl font-bold">Sign in to view your cultural passport</h2>
          <p className="text-muted-foreground">Create an account or log in to track your purchases and unlock digital stamps.</p>
          <Button onClick={() => navigate('/auth')} data-testid="button-authenticate">Log In / Sign Up</Button>
        </div>
      </div>
    );
  }

  if (!authLoading && user && user.role !== "shopper") {
    return (
      <div className="min-h-screen p-8 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <i className="fas fa-user-shield text-6xl text-muted-foreground"></i>
          <h2 className="font-serif text-3xl font-bold">Shopper account required</h2>
          <p className="text-muted-foreground">Switch to a shopper profile to view passport details, or continue to manage your brand dashboard.</p>
          <Button variant="outline" onClick={() => navigate('/brand-dashboard')}>Go to Brand Dashboard</Button>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { value: "all", label: "All Stamps" },
    { value: "region", label: "By Region" },
    { value: "craft", label: "By Craft" },
  ];

  // Only show loading if auth is loading, or if we're loading passport data for a logged-in user
  if (authLoading || (userId && isLoading)) {
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
          <h2 className="font-serif text-2xl font-bold mb-2">
            No Passport Found
          </h2>
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
          <h1
            className="font-serif text-5xl font-bold mb-2"
            data-testid="passport-title"
          >
            My Passport
          </h1>
          <p className="text-muted-foreground text-lg">
            Your cultural journey and impact story
          </p>
        </div>

        {/* User Profile Card */}
        <div
          className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 mb-8 text-white shadow-xl"
          data-testid="user-profile-card"
        >
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
                  Member since{" "}
                  {userPassport.user.createdAt
                    ? new Date(userPassport.user.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" },
                      )
                    : "Recently"}
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
              <p
                className="text-5xl font-bold metric-counter"
                data-testid="total-stamps"
              >
                {userPassport.stamps.length}
              </p>
              <p className="text-white/80 text-sm">Stamps Collected</p>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div
          className="grid md:grid-cols-4 gap-6 mb-8"
          data-testid="impact-summary"
        >
          <Card className="p-6 shadow-sm">
            <i className="fas fa-water text-secondary text-3xl mb-3"></i>
            <p
              className="metric-counter text-3xl font-bold mb-1"
              data-testid="water-saved"
            >
              {userPassport.totalImpact.waterSaved.toLocaleString()}L
            </p>
            <p className="text-sm text-muted-foreground">Water Saved</p>
          </Card>

          <Card className="p-6 shadow-sm">
            <i className="fas fa-seedling text-secondary text-3xl mb-3"></i>
            <p
              className="metric-counter text-3xl font-bold mb-1"
              data-testid="co2-offset"
            >
              {userPassport.totalImpact.co2Offset.toFixed(1)}kg
            </p>
            <p className="text-sm text-muted-foreground">CO₂ Offset</p>
          </Card>

          <Card className="p-6 shadow-sm">
            <i className="fas fa-users text-accent text-3xl mb-3"></i>
            <p
              className="metric-counter text-3xl font-bold mb-1"
              data-testid="artisans-supported"
            >
              {userPassport.totalImpact.artisansSupported}
            </p>
            <p className="text-sm text-muted-foreground">Artisans Supported</p>
          </Card>

          <Card className="p-6 shadow-sm">
            <i className="fas fa-globe-americas text-primary text-3xl mb-3"></i>
            <p
              className="metric-counter text-3xl font-bold mb-1"
              data-testid="countries-explored"
            >
              {userPassport.totalImpact.countriesExplored}
            </p>
            <p className="text-sm text-muted-foreground">Countries Explored</p>
          </Card>
        </div>

        {/* Cultural Footprint Map */}
        <Card className="mb-8 shadow-sm" data-testid="passport-map">
          <CardHeader>
            <CardTitle className="font-serif text-3xl font-bold">
              Cultural Footprint
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Countries highlighted reflect garments you've collected
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative w-full">
              <ComposableMap
                projectionConfig={{ scale: 145 }}
                style={{ width: "100%", height: "auto" }}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      // 1. Get the official ISO A3 code from the map's properties
                      const geoIsoCode = (
                        geo.properties?.ISO_A3 ?? // Standard
                        geo.properties?.ADM0_A3 ?? // Admin-0
                        geo.properties?.ISO_A3_EH // For disputed areas
                      ) as string | undefined;

                      // 2. Check if this code is in the set you already built
                      const isVisited =
                        !!geoIsoCode &&
                        visitedIsoSet.has(geoIsoCode.toUpperCase());

                      const countryName = (geo.properties?.NAME_LONG ||
                        geo.properties?.NAME) as string | undefined;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            if (countryName) {
                              setHoveredCountry(countryName);
                            }
                          }}
                          onMouseLeave={() => setHoveredCountry(null)}
                          // 3. Apply the fill color based on the simple check
                          fill={isVisited ? visitedFillColor : "#E5E7EB"}
                          stroke="transparent"
                          strokeWidth={0}
                          style={{
                            default: { outline: "none" },
                            hover: {
                              outline: "none",
                              fill: isVisited ? visitedFillColor : "#F3F4F6",
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {visitedDisplayNames.length > 0 ? (
                visitedDisplayNames.map((name) => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Unlock garments from around the world to see your map light
                  up.
                </p>
              )}
            </div>
            {hoveredCountry && (
              <p className="text-sm text-muted-foreground mt-4">
                Exploring: {hoveredCountry}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Badges Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl font-bold">Badges Earned</h2>
            <span
              className="text-sm text-muted-foreground"
              data-testid="badge-progress"
            >
              {userPassport.badges.length} of {allBadges.length} unlocked
            </span>
          </div>

          <div className="grid md:grid-cols-4 gap-6" data-testid="badges-grid">
            {allBadges.map((badge) => {
              const userBadge = userPassport.badges.find(
                (ub) => ub.badgeId === badge.id,
              );
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={!!userBadge}
                  earnedAt={userBadge?.earnedAt ?? undefined}
                />
              );
            })}
          </div>
        </div>

        {/* Stamp Collection */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl font-bold">
              My Stamp Collection
            </h2>
            <div className="flex gap-3">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    activeFilter === option.value ? "default" : "secondary"
                  }
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
              <h3 className="font-serif text-2xl font-bold mb-2">
                No Stamps Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start your collection by scanning your first garment!
              </p>
              <Button>Scan Garment</Button>
            </div>
          ) : (
            <div
              className="grid md:grid-cols-3 gap-6"
              data-testid="stamps-grid"
            >
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