"use client";
"use no memo";

import * as React from "react";
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Download, Search, Building2, Calendar, Mail, Phone, ShieldCheck, Clock, MapPin, ListFilter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseISO, format } from "date-fns";
import apiClient from "@/lib/api-client";

import { requestsColumns } from "./requests-columns";
import { RequestsTable } from "./requests-table";

import { type OwnerRequestDto, type OwnerRequestDetailDto } from "./types";

const statusFilterOptions = [
  { label: "Tất cả trạng thái", value: "All" },
  { label: "Đang chờ duyệt", value: "Pending" },
  { label: "Đã phê duyệt", value: "Verified" },
  { label: "Bị từ chối", value: "Rejected" },
];

export function OwnerRequests() {
  const [requests, setRequests] = React.useState<OwnerRequestDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "submittedAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    search: false,
  });
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Detailed view state
  const [detailUserId, setDetailUserId] = React.useState<string | null>(null);
  const [detailData, setDetailData] = React.useState<OwnerRequestDetailDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isDetailLoading, setIsDetailLoading] = React.useState(false);

  // Reject state
  const [rejectUserId, setRejectUserId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);

  const fetchRequests = React.useCallback(async (status?: string) => {
    setIsLoading(true);
    try {
      const url = status && status !== "All" 
        ? `/api/admin/owner-requests?status=${status}`
        : "/api/admin/owner-requests";
      const res: any = await apiClient.get(url);
      if (res && res.isSuccess && res.data) {
        setRequests(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch owner requests:", err);
      toast.error("Không thể tải danh sách yêu cầu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const loadDetail = async (userId: string) => {
    setIsDetailLoading(true);
    setDetailUserId(userId);
    setIsDetailOpen(true);
    try {
      const res: any = await apiClient.get(`/api/admin/owner-requests/${userId}`);
      if (res && res.isSuccess && res.data) {
        setDetailData(res.data);
      } else {
        toast.error("Không thể tải thông tin chi tiết.");
        setIsDetailOpen(false);
      }
    } catch (err) {
      console.error("Failed to fetch request detail:", err);
      toast.error("Lỗi khi tải chi tiết yêu cầu.");
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const res: any = await apiClient.post(`/api/admin/owner-requests/${userId}/approve`);
      if (res && res.isSuccess) {
        toast.success("Đã phê duyệt yêu cầu thành công!");
        setIsDetailOpen(false);
        fetchRequests();
      } else {
        toast.error("Phê duyệt thất bại.");
      }
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error("Lỗi khi gửi yêu cầu phê duyệt.");
    }
  };

  const handleRejectPrompt = (userId: string) => {
    setRejectUserId(userId);
    setRejectReason("");
    setIsRejectOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      const res: any = await apiClient.post(`/api/admin/owner-requests/${rejectUserId}/reject`, {
        reason: rejectReason,
      });
      if (res && res.isSuccess) {
        toast.success("Đã từ chối yêu cầu thành công.");
        setIsRejectOpen(false);
        setIsDetailOpen(false);
        fetchRequests();
      } else {
        toast.error("Từ chối yêu cầu thất bại.");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error("Lỗi khi gửi yêu cầu từ chối.");
    }
  };

  const table = useReactTable({
    data: requests,
    columns: requestsColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    meta: {
      onViewDetails: (row: OwnerRequestDto) => loadDetail(row.userId),
      onApprove: handleApprove,
      onReject: handleRejectPrompt,
    },
    getRowId: (row) => row.userId,
    autoResetPageIndex: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const statusFilterValue = (table.getColumn("verificationStatus")?.getFilterValue() as string) ?? "All";
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <CardTitle className="text-xl leading-none">Yêu cầu Owner</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            Xét duyệt hồ sơ nâng cấp đối tác doanh nghiệp và đăng ký vận hành sân thể thao.
          </CardDescription>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <InputGroup className="h-7 w-full md:w-64">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7"
                placeholder="Tìm tên, email, sân đề xuất..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>
            <Button variant="outline" size="sm">
              <Download /> Xuất báo cáo
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={statusFilterValue} onValueChange={(value) => {
                if (value === "All") {
                  table.getColumn("verificationStatus")?.setFilterValue(undefined);
                } else {
                  table.getColumn("verificationStatus")?.setFilterValue(value);
                }
                table.setPageIndex(0);
                fetchRequests(value);
              }}>
                <SelectTrigger size="sm" className="w-[180px]">
                  <span className="text-muted-foreground mr-1 flex items-center gap-1">
                    <ListFilter className="size-3.5" /> Bộ lọc:
                  </span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectGroup>
                    {statusFilterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="text-muted-foreground text-sm tabular-nums">
              Đã chọn {selectedCount} yêu cầu
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-muted-foreground">
              Đang tải danh sách yêu cầu nâng cấp Owner...
            </div>
          ) : (
            <RequestsTable table={table} />
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Chi tiết yêu cầu nâng cấp đối tác Owner</DialogTitle>
            <DialogDescription>
              Xem xét hồ sơ người dùng và cơ sở sân thể thao đề xuất để phê duyệt.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading || !detailData ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground">
              <span className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
              <span>Đang tải thông tin chi tiết hồ sơ...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Trạng thái phê duyệt</div>
                  <div className="flex items-center gap-2">
                    <Badge className="font-semibold" variant={
                      detailData.verificationStatus === "Verified" ? "default" :
                      detailData.verificationStatus === "Rejected" ? "destructive" : "secondary"
                    }>
                      {detailData.verificationStatus === "Verified" && "Đã phê duyệt"}
                      {detailData.verificationStatus === "Rejected" && "Đã từ chối"}
                      {detailData.verificationStatus === "Pending" && "Đang chờ xét duyệt"}
                    </Badge>
                    {detailData.submittedAt && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" /> Gửi ngày {format(parseISO(detailData.submittedAt), "dd/MM/yyyy HH:mm")}
                      </span>
                    )}
                  </div>
                </div>

                {detailData.verificationStatus === "Rejected" && detailData.rejectReason && (
                  <div className="max-w-[40%] text-right">
                    <div className="text-xs text-muted-foreground font-medium uppercase">Lý do từ chối</div>
                    <div className="text-sm text-destructive font-medium break-words">{detailData.rejectReason}</div>
                  </div>
                )}
              </div>

              {/* Grid 2 Columns for User and Venue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: User Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground/80">
                    <ShieldCheck className="size-4 text-primary" /> Thông tin người dùng
                  </h4>
                  <div className="border rounded-lg p-4 space-y-3 bg-card">
                    <div className="flex items-center gap-3">
                      <img 
                        src={detailData.avatarUrl || "/icon/avata_boy_1.avif"} 
                        alt={detailData.fullName || detailData.username} 
                        className="size-12 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-semibold text-sm text-foreground">{detailData.fullName || "Chưa cập nhật"}</div>
                        <div className="text-xs text-muted-foreground">@{detailData.username}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Mail className="size-3.5" /> Email:</span>
                        <span className="font-medium text-foreground">{detailData.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="size-3.5" /> Số điện thoại:</span>
                        <span className="font-medium text-foreground">{detailData.phone || "Chưa cập nhật"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Điểm uy tín:</span>
                        <Badge variant="outline" className="font-mono">{Math.round(detailData.trustScore)} / 100</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="size-3.5" /> Ngày đăng ký:</span>
                        <span className="font-medium text-foreground">
                          {detailData.userCreatedAt ? format(parseISO(detailData.userCreatedAt), "dd/MM/yyyy") : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Proposed Venue Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground/80">
                    <Building2 className="size-4 text-primary" /> Thông tin cơ sở đề xuất
                  </h4>
                  <div className="border rounded-lg p-4 space-y-3 bg-card">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-sm text-foreground">{detailData.venueName || "Chưa thiết lập"}</div>
                      <div className="text-xs text-muted-foreground flex items-start gap-1">
                        <MapPin className="size-3 mt-0.5 shrink-0" /> 
                        <span className="line-clamp-2">{detailData.venueAddress || "Chưa thiết lập địa chỉ"}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="size-3.5" /> Hotline cơ sở:</span>
                        <span className="font-medium text-foreground">{detailData.venuePhone || "Chưa cập nhật"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="size-3.5" /> Giờ hoạt động:</span>
                        <span className="font-medium text-foreground">
                          {detailData.operatingStartHour} - {detailData.operatingEndHour}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Building2 className="size-3.5" /> Quy mô sân:</span>
                        <span className="font-medium text-foreground font-mono">{detailData.venueScale} sân</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Môn thể thao hỗ trợ:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {detailData.sportTypes && detailData.sportTypes.length > 0 ? (
                            detailData.sportTypes.map(sport => (
                              <Badge key={sport} variant="secondary" className="text-[10px] py-0 px-1.5">{sport}</Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground italic">Chưa khai báo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Intro */}
              {detailData.description && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground/80">Giới thiệu về cơ sở sân</h4>
                  <div className="border rounded-lg p-3 bg-muted/20 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {detailData.description}
                  </div>
                </div>
              )}

              {/* Venue Images Section */}
              {detailData.venueImages && detailData.venueImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground/80">Hình ảnh đính kèm ({detailData.venueImages.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {detailData.venueImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border bg-muted group">
                        <img 
                          src={imgUrl} 
                          alt={`Venue image ${idx + 1}`} 
                          className="size-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dialog Footer Actions */}
              <DialogFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Đóng
                </Button>
                {detailData.verificationStatus === "Pending" && (
                  <>
                    <Button variant="destructive" onClick={() => handleRejectPrompt(detailData.userId)}>
                      Từ chối yêu cầu
                    </Button>
                    <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(detailData.userId)}>
                      Phê duyệt hồ sơ
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Input Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lý do từ chối yêu cầu</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối hồ sơ này. Lý do sẽ được hiển thị cho đối tác ở phần Onboarding.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Nhập nội dung từ chối tại đây (ví dụ: Hình ảnh sân không hợp lệ, Giấy phép kinh doanh không khớp...)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full resize-none text-sm"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
