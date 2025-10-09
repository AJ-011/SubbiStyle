import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Badge as BadgeType } from "@shared/schema";

interface BadgeCardProps {
  badge: BadgeType;
  isUnlocked: boolean;
  earnedAt?: Date;
}

export default function BadgeCard({ badge, isUnlocked, earnedAt }: BadgeCardProps) {
  const getIconClass = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'book-reader': 'fas fa-book-reader',
      'tint': 'fas fa-tint',
      'leaf': 'fas fa-leaf',
      'users': 'fas fa-users',
      'palette': 'fas fa-palette',
      'crown': 'fas fa-crown',
    };
    return iconMap[iconName] || 'fas fa-star';
  };

  const getRequirementText = () => {
    if (badge.requiredStamps) {
      return `Collect ${badge.requiredStamps} stamp${badge.requiredStamps > 1 ? 's' : ''}`;
    }
    if (badge.requiredCountries) {
      return `Explore ${badge.requiredCountries} countr${badge.requiredCountries > 1 ? 'ies' : 'y'}`;
    }
    return 'Complete special achievement';
  };

  return (
    <Card 
      className={`stamp-card cursor-pointer transition-all ${
        isUnlocked ? 'badge-glow' : 'opacity-50'
      }`}
      data-testid={`badge-card-${badge.id}`}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg ${
            isUnlocked 
              ? 'bg-gradient-to-br from-accent to-primary' 
              : 'bg-muted/30'
          }`}>
            <i className={`${getIconClass(badge.icon)} ${
              isUnlocked ? 'text-white text-3xl' : 'text-muted text-2xl'
            }`}></i>
          </div>
          
          <h3 className="font-bold mb-1" data-testid={`badge-name-${badge.id}`}>
            {badge.name}
          </h3>
          
          <p className="text-xs text-muted-foreground mb-2">
            {getRequirementText()}
          </p>
          
          <Badge 
            variant={isUnlocked ? "secondary" : "outline"}
            className={`text-xs ${
              isUnlocked 
                ? 'bg-secondary/20 text-secondary' 
                : 'bg-muted/20 text-muted-foreground'
            }`}
          >
            {isUnlocked ? 'Unlocked' : 'Locked'}
          </Badge>
          
          {isUnlocked && earnedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Earned {new Date(earnedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
