"use client";
"use no memo";

import * as React from "react";
import { Search, Building2, MapPin, Phone, Clock, Star, Landmark, Award, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import apiClient from "@/lib/api-client";

export type PublicCourtDto = {
  id: string;
  courtName: string;
  status: string;
};

export type PublicPriceRuleDto = {
  dayOfWeek: number | null;
  startHour: string;
  endHour: string;
  price: number;
};

export type PublicVenueDto = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  operatingStartHour: string;
  operatingEndHour: string;
  venueScale: number;
  minPrice: number;
  rating: number;
  reviewCount: number;
  avatarUrl: string | null;
  sportTypes: string[];
};

export type PublicVenueDetailDto = PublicVenueDto & {
  bankQrUrl: string | null;
  contactPhone: string | null;
  galleryImages: string[];
  courts: PublicCourtDto[];
  priceRules: PublicPriceRuleDto[];
};

export function Venues() {
  const [venues, setVenues] = React.useState<PublicVenueDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Detail modal state
  const [detailData, setDetailData] = React.useState<PublicVenueDetailDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isDetailLoading, setIsDetailLoading] = React.useState(false);

  const fetchVenues = React.useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const url = search ? `/api/public/venues?search=${encodeURIComponent(search)}` : "/api/public/venues";
      const res: any = await apiClient.get(url);
      if (res && res.isSuccess && res.data) {
        setVenues(res.data);
      } else {
        setVenues([]);
      }
    } catch (err) {
      console.error("Failed to fetch active venues:", err);
      toast.error("Không thể tải danh sách cơ sở sân.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVenues(searchQuery);
  };

  const handleViewDetails = async (id: string) => {
    setIsDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const res: any = await apiClient.get(`/api/public/venues/${id}`);
      if (res && res.isSuccess && res.data) {
        setDetailData(res.data);
      } else {
        toast.error("Không thể tải chi tiết cơ sở.");
        setIsDetailOpen(false);
      }
    } catch (err) {
      console.error("Failed to fetch venue details:", err);
      toast.error("Lỗi khi tải chi tiết cơ sở sân.");
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const getDayName = (day: number | null) => {
    if (day === null) return "Mọi ngày";
    if (day === 0) return "Chủ nhật";
    return `Thứ ${day + 1}`;
  };

  return (
    <div className="space-y-4">
      {/* Search Header Card */}
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div>
            <CardTitle className="text-xl leading-none">Cơ sở Sân Thể Thao</CardTitle>
            <CardDescription className="max-w-sm leading-snug">
              Xem danh sách các sân thể thao đã phê duyệt và đang hoạt động trên hệ thống.
            </CardDescription>
          </div>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
              <InputGroup className="h-7 w-full md:w-64">
                <InputGroupAddon align="inline-start">
                  <Search className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  className="h-7"
                  placeholder="Tìm kiếm sân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Button type="submit" variant="default" size="sm">
                Tìm kiếm
              </Button>
            </form>
          </CardAction>
        </CardHeader>
        <CardContent className="py-4 px-4">
          <div className="text-muted-foreground text-sm">
            Tổng số cơ sở hoạt động: <span className="font-semibold text-foreground">{venues.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Grid List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          Đang tải danh sách cơ sở sân thể thao...
        </div>
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border rounded-lg bg-card text-muted-foreground space-y-2">
          <ShieldAlert className="size-8 text-muted-foreground/60" />
          <span>Chưa có cơ sở sân nào hoạt động hoặc khớp với tìm kiếm.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <Card 
              key={venue.id} 
              className="overflow-hidden border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              {/* Cover Image placeholder / real avatar */}
              <div className="relative aspect-video w-full bg-muted/60 border-b flex items-center justify-center overflow-hidden group">
                {venue.avatarUrl ? (
                  <img 
                    src={venue.avatarUrl} 
                    alt={venue.name} 
                    className="size-full object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                ) : (
                  <Building2 className="size-12 text-muted-foreground/30" />
                )}
                
                {venue.rating > 0 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-yellow-400 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 shadow">
                    <Star className="size-3 fill-current" />
                    <span>{venue.rating.toFixed(1)}</span>
                    <span className="text-white/60 font-normal">({venue.reviewCount})</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                      <MapPin className="size-3 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{venue.address}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {venue.sportTypes && venue.sportTypes.map((sport) => (
                      <Badge key={sport} variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    <span>{venue.operatingStartHour.substring(0, 5)} - {venue.operatingEndHour.substring(0, 5)}</span>
                  </div>
                  <div>
                    Quy mô: <span className="font-semibold text-foreground">{venue.venueScale} sân</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-xs">
                    <div className="text-muted-foreground">Giá chỉ từ</div>
                    <div className="font-bold text-sm text-primary">{formatPrice(venue.minPrice)}<span className="font-normal text-[10px] text-muted-foreground">/h</span></div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(venue.id)}>
                    Chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Chi tiết Cơ sở Sân Thể Thao</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết, sơ đồ danh sách sân nhỏ và cấu hình bảng giá.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading || !detailData ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground">
              <span className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
              <span>Đang tải thông tin chi tiết cơ sở...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Name & Basic Info banner */}
              <div className="border rounded-lg p-4 bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">{detailData.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-start gap-1">
                    <MapPin className="size-4 mt-0.5 shrink-0" />
                    <span>{detailData.address}</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs pt-1">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="size-3.5" /> Hotline: <strong className="text-foreground">{detailData.contactPhone || "Chưa cập nhật"}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-3.5" /> Hoạt động: <strong className="text-foreground">{detailData.operatingStartHour.substring(0, 5)} - {detailData.operatingEndHour.substring(0, 5)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center md:items-end gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                  <div className="flex items-center gap-1.5">
                    <Award className="size-4 text-yellow-500" />
                    <span className="text-sm font-semibold">Đánh giá trung bình:</span>
                    <span className="font-bold text-sm bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">
                      {detailData.rating > 0 ? `${detailData.rating.toFixed(1)} / 5.0` : "Chưa có"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({detailData.reviewCount} lượt đánh giá từ khách hàng)
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              {detailData.galleryImages && detailData.galleryImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground/80">Thư viện ảnh ({detailData.galleryImages.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {detailData.galleryImages.map((imgUrl, idx) => (
                      <div key={idx} className="aspect-video rounded-lg overflow-hidden border bg-muted">
                        <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="size-full object-cover hover:scale-105 transition duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {detailData.description && (
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-sm text-foreground/80">Giới thiệu</h4>
                  <div className="p-3 border rounded-lg bg-card text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {detailData.description}
                  </div>
                </div>
              )}

              {/* Grid 2 Columns for Courts and Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Courts List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground/80">
                    <Building2 className="size-4 text-primary" /> Danh sách sân ({detailData.courts.length})
                  </h4>
                  <div className="border rounded-lg divide-y max-h-[250px] overflow-y-auto bg-card">
                    {detailData.courts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground italic">Chưa cấu hình sân nhỏ</div>
                    ) : (
                      detailData.courts.map((court) => (
                        <div key={court.id} className="p-3 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{court.courtName}</span>
                          <Badge 
                            variant="outline" 
                            className={
                              court.status === "AVAILABLE" 
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }
                          >
                            {court.status === "AVAILABLE" ? "Sẵn sàng" : "Bận / Bảo trì"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2: Price Rules */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground/80">
                    <Landmark className="size-4 text-primary" /> Khung giờ & Bảng giá
                  </h4>
                  <div className="border rounded-lg divide-y max-h-[250px] overflow-y-auto bg-card">
                    {detailData.priceRules.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground italic">Chưa cấu hình bảng giá</div>
                    ) : (
                      detailData.priceRules.map((rule, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-sm">
                          <div className="space-y-0.5">
                            <span className="font-medium text-foreground">{getDayName(rule.dayOfWeek)}</span>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3" />
                              <span>{rule.startHour.substring(0, 5)} - {rule.endHour.substring(0, 5)}</span>
                            </div>
                          </div>
                          <span className="font-semibold text-primary">{formatPrice(rule.price)}<span className="text-[10px] font-normal text-muted-foreground">/h</span></span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* QR Bank */}
              {detailData.bankQrUrl && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground/80">QR thanh toán/Nhận cọc</h4>
                  <div className="flex justify-start">
                    <div className="border rounded-lg p-2 bg-white max-w-[160px]">
                      <img src={detailData.bankQrUrl} alt="Bank QR Code" className="w-full aspect-square object-contain" />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="border-t pt-4">
                <Button variant="default" onClick={() => setIsDetailOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
