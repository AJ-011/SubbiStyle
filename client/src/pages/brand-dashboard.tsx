import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertGarmentSchema, insertArtisanSchema, insertBrandSchema, insertImpactMetricsSchema, insertCulturalContentSchema, insertCareInstructionsSchema, insertNfcCodeSchema, type Brand, type GarmentWithDetails } from "@shared/schema";
import { z } from "zod";

// Extended form schema for the complete garment onboarding
const garmentFormSchema = insertGarmentSchema.extend({
  // Artisan information
  artisanName: z.string().min(1, "Artisan name is required"),
  artisanBio: z.string().optional(),
  artisanExperience: z.number().min(0).optional(),
  artisanGeneration: z.number().min(1).optional(),
  
  // Impact metrics
  waterSaved: z.number().min(0).optional(),
  co2Offset: z.number().min(0).optional(),
  artisansSupported: z.number().min(1).optional(),
  
  // Cultural content
  culturalContentType: z.enum(["recipe", "music", "video", "myth", "vocabulary", "technique", "history"]).optional(),
  culturalTitle: z.string().optional(),
  culturalDescription: z.string().optional(),
  
  // Care instructions
  washingInstructions: z.string().optional(),
  dryingInstructions: z.string().optional(),
  storageTips: z.string().optional(),
  repairTips: z.string().optional(),
  
  // NFC/QR
  nfcUid: z.string().optional(),
  quantity: z.number().min(1).default(1),
});

type GarmentFormData = z.infer<typeof garmentFormSchema>;

export default function BrandDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("onboarding");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  const { data: garments = [] } = useQuery<GarmentWithDetails[]>({
    queryKey: ["/api/garments"],
  });

  if (!loading && !user) {
    return (
      <div className="min-h-screen p-8 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <i className="fas fa-user-tie text-6xl text-muted-foreground"></i>
          <h2 className="font-serif text-3xl font-bold">Log in to manage your brand</h2>
          <p className="text-muted-foreground">Brand partners can access dashboards after signing in.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (!loading && user && user.role !== 'brand') {
    return (
      <div className="min-h-screen p-8 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <i className="fas fa-store-alt text-6xl text-muted-foreground"></i>
          <h2 className="font-serif text-3xl font-bold">Brand access required</h2>
          <p className="text-muted-foreground">Switch to a brand account or contact support to become a partner.</p>
          <Button variant="outline" onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  const form = useForm<GarmentFormData>({
    resolver: zodResolver(garmentFormSchema),
    defaultValues: {
      category: "clothing",
      isActive: true,
      quantity: 1,
    },
  });

  const { mutate: generateCulturalContent, isPending: isGeneratingContent } = useMutation({
    mutationFn: async (data: {
      garmentName: string;
      origin: string;
      craftTechnique: string;
      artisanName: string;
      materials: string[];
      culturalContext?: string;
    }) => {
      const response = await apiRequest("POST", "/api/generate/cultural-content", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Auto-populate cultural content fields with AI-generated data
      form.setValue("culturalTitle", data.craftHistory?.title || "");
      form.setValue("culturalDescription", data.craftHistory?.content || "");
      toast({
        title: "Content Generated",
        description: "AI-generated cultural content has been added to your form.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate cultural content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: createGarment, isPending: isCreatingGarment } = useMutation({
    mutationFn: async (data: GarmentFormData) => {
      // Create brand if not exists (for demo purposes, using first brand)
      const brandId = brands[0]?.id || "brand-1";
      
      // Create artisan
      const artisan = await apiRequest("POST", "/api/artisans", {
        name: data.artisanName,
        bio: data.artisanBio,
        location: data.origin,
        craft: data.techniques?.[0] || "Traditional Craft",
        experience: data.artisanExperience,
        generation: data.artisanGeneration,
        isVerified: true,
      });
      const artisanData = await artisan.json();

      // Create garment
      const garment = await apiRequest("POST", "/api/garments", {
        brandId,
        artisanId: artisanData.id,
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        images: data.images,
        origin: data.origin,
        materials: data.materials,
        techniques: data.techniques,
        isActive: data.isActive,
        isVerified: false, // Requires manual verification
      });
      const garmentData = await garment.json();

      // Create impact metrics if provided
      if (data.waterSaved || data.co2Offset || data.artisansSupported) {
        await apiRequest("POST", "/api/impact-metrics", {
          garmentId: garmentData.id,
          waterSaved: data.waterSaved?.toString(),
          co2Offset: data.co2Offset?.toString(),
          artisansSupported: data.artisansSupported,
        });
      }

      // Create cultural content if provided
      if (data.culturalTitle && data.culturalDescription) {
        await apiRequest("POST", "/api/cultural-content", {
          garmentId: garmentData.id,
          contentType: data.culturalContentType || "history",
          title: data.culturalTitle,
          description: data.culturalDescription,
          content: { text: data.culturalDescription },
          isAiGenerated: true,
        });
      }

      // Create care instructions if provided
      if (data.washingInstructions || data.dryingInstructions || data.storageTips || data.repairTips) {
        await apiRequest("POST", "/api/care-instructions", {
          garmentId: garmentData.id,
          washingInstructions: data.washingInstructions,
          dryingInstructions: data.dryingInstructions,
          storageTips: data.storageTips,
          repairTips: data.repairTips,
        });
      }

      // Create NFC/QR codes
      for (let i = 0; i < data.quantity; i++) {
        await apiRequest("POST", "/api/nfc-codes", {
          garmentId: garmentData.id,
          nfcUid: data.nfcUid ? `${data.nfcUid}-${i + 1}` : undefined,
          qrCode: `SUB-${garmentData.id}-${i + 1}`,
          isActive: true,
        });
      }

      return garmentData;
    },
    onSuccess: () => {
      toast({
        title: "Garment Created",
        description: "Your garment has been submitted for verification.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/garments"] });
      setActiveTab("analytics");
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create garment. Please check your data and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GarmentFormData) => {
    createGarment(data);
  };

  const handleGenerateContent = () => {
    const formData = form.getValues();
    if (!formData.name || !formData.origin || !formData.artisanName) {
      toast({
        title: "Missing Information",
        description: "Please fill in garment name, origin, and artisan name first.",
        variant: "destructive",
      });
      return;
    }

    generateCulturalContent({
      garmentName: formData.name,
      origin: formData.origin,
      craftTechnique: (formData.techniques && formData.techniques.length > 0 ? formData.techniques[0] : "Traditional craft") as string,
      artisanName: formData.artisanName,
      materials: (formData.materials || []) as string[],
    });
  };

  // Mock analytics data for demonstration
  const analyticsData = {
    totalGarments: garments.length,
    totalUnlocks: 892,
    totalEngagements: 12400,
    totalShares: 324,
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="font-serif text-5xl font-bold mb-2" data-testid="dashboard-title">
            Brand Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Onboard your collections and track your impact
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8" data-testid="quick-stats">
          <Card className="p-6 shadow-sm">
            <i className="fas fa-tshirt text-primary text-3xl mb-3"></i>
            <p className="metric-counter text-3xl font-bold mb-1">{analyticsData.totalGarments}</p>
            <p className="text-sm text-muted-foreground">Garments Listed</p>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <i className="fas fa-qrcode text-accent text-3xl mb-3"></i>
            <p className="metric-counter text-3xl font-bold mb-1">{analyticsData.totalUnlocks}</p>
            <p className="text-sm text-muted-foreground">Passports Unlocked</p>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <i className="fas fa-chart-line text-secondary text-3xl mb-3"></i>
            <p className="metric-counter text-3xl font-bold mb-1">{(analyticsData.totalEngagements / 1000).toFixed(1)}k</p>
            <p className="text-sm text-muted-foreground">Total Engagements</p>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <i className="fas fa-share-alt text-primary text-3xl mb-3"></i>
            <p className="metric-counter text-3xl font-bold mb-1">{analyticsData.totalShares}</p>
            <p className="text-sm text-muted-foreground">Social Shares</p>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="onboarding" data-testid="tab-onboarding">
              Add New Garment
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              Analytics & Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="onboarding">
            {/* Onboarding Form */}
            <Card className="shadow-lg" data-testid="onboarding-form">
              <CardHeader>
                <CardTitle className="font-serif text-3xl font-bold">Add New Garment</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Garment Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Handwoven Rebozo Shawl" 
                                {...field} 
                                data-testid="input-garment-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="clothing">Clothing</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                                <SelectItem value="textiles">Textiles</SelectItem>
                                <SelectItem value="jewelry">Jewelry</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3}
                              placeholder="Describe your garment, its cultural significance, and craftsmanship..."
                              {...field}
                              value={field.value || ''}
                              data-testid="input-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                                data-testid="input-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Oaxaca, Mexico"
                                {...field}
                                data-testid="input-origin"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="artisanName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Artisan Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., María Elena Torres"
                                {...field}
                                data-testid="input-artisan-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Impact Metrics */}
                    <Card className="bg-secondary/10 border border-secondary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <i className="fas fa-leaf text-secondary"></i>
                          Environmental Impact Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="waterSaved"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Water Saved (Liters)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    placeholder="280"
                                    {...field}
                                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    data-testid="input-water-saved"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="co2Offset"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CO₂ Offset (kg)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    step="0.1"
                                    placeholder="3.2"
                                    {...field}
                                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    data-testid="input-co2-offset"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="artisansSupported"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Artisans Involved</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    placeholder="5"
                                    {...field}
                                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    data-testid="input-artisans-supported"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cultural Content */}
                    <Card className="bg-accent/10 border border-accent/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <i className="fas fa-book-open text-accent"></i>
                          Cultural Content (AI-Assisted)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="culturalDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Craft Technique/History</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    rows={3}
                                    placeholder="Describe the traditional technique... (AI will help expand this)"
                                    {...field}
                                    data-testid="input-cultural-description"
                                  />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  variant="link" 
                                  className="mt-2 p-0 text-primary text-sm font-medium"
                                  onClick={handleGenerateContent}
                                  disabled={isGeneratingContent}
                                  data-testid="button-generate-ai-content"
                                >
                                  <i className="fas fa-magic mr-1"></i>
                                  {isGeneratingContent ? "Generating..." : "Generate with AI"}
                                </Button>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="culturalContentType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cultural Media Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-cultural-type">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="recipe">Recipe</SelectItem>
                                      <SelectItem value="music">Music</SelectItem>
                                      <SelectItem value="video">Video/Demo</SelectItem>
                                      <SelectItem value="myth">Myth/Legend</SelectItem>
                                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                                      <SelectItem value="technique">Technique</SelectItem>
                                      <SelectItem value="history">History</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="culturalTitle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Content Title</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Traditional Weaving Techniques"
                                      {...field}
                                      data-testid="input-cultural-title"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* NFC/QR Assignment */}
                    <Card className="bg-primary/10 border border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <i className="fas fa-qrcode text-primary"></i>
                          NFC/QR Code Assignment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="nfcUid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>NFC Tag UID (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="04:A3:2B:C9:4D:E0:80"
                                    className="font-mono text-sm"
                                    {...field}
                                    data-testid="input-nfc-uid"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity to Generate</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min={1}
                                    placeholder="50"
                                    {...field}
                                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                                    data-testid="input-quantity"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={isCreatingGarment}
                        data-testid="button-submit-garment"
                      >
                        {isCreatingGarment ? "Creating..." : "Submit for Verification"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => form.reset()}
                        data-testid="button-save-draft"
                      >
                        Reset Form
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            {/* Recent Garments Table */}
            <Card className="shadow-lg" data-testid="garments-table">
              <CardHeader>
                <CardTitle className="font-serif text-2xl font-bold">Recent Garments</CardTitle>
              </CardHeader>
              <CardContent>
                {garments.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-garments">
                    <i className="fas fa-tshirt text-6xl text-muted-foreground mb-4"></i>
                    <h3 className="font-serif text-xl font-bold mb-2">No Garments Yet</h3>
                    <p className="text-muted-foreground">
                      Add your first garment to get started
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/20 border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Garment</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Origin</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {garments.slice(0, 10).map((garment) => (
                          <tr key={garment.id} className="hover:bg-muted/10">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-muted/30 rounded-lg"></div>
                                <div>
                                  <p className="font-medium" data-testid={`garment-name-${garment.id}`}>
                                    {garment.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {garment.category}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">{garment.origin}</td>
                            <td className="px-6 py-4">
                              <Badge 
                                variant={garment.isVerified ? "secondary" : "outline"}
                                className={garment.isVerified ? "bg-secondary/20 text-secondary" : "bg-accent/20 text-accent-foreground"}
                              >
                                {garment.isVerified ? "Verified" : "Pending Review"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold">${garment.price}</td>
                            <td className="px-6 py-4">
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="text-primary hover:underline"
                                data-testid={`button-view-analytics-${garment.id}`}
                              >
                                View Analytics
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
