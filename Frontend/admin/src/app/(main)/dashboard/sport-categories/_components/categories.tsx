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
import { Plus, Search, Trophy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import apiClient from "@/lib/api-client";

import { categoriesColumns } from "./categories-columns";
import { CategoriesTable } from "./categories-table";

export type SportCategoryDto = {
  id: number;
  name: string;
  color: string;
  icon: string;
  status: boolean;
};

export function SportCategories() {
  const [categories, setCategories] = React.useState<SportCategoryDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "id", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Modal / Form state
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [currentId, setCurrentId] = React.useState<number | null>(null);

  // Form fields
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#3b82f6");
  const [icon, setIcon] = React.useState("Trophy");
  const [status, setStatus] = React.useState("true");

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get("/api/SportCategories");
      if (res && Array.isArray(res)) {
        setCategories(res);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch sport categories:", err);
      toast.error("Không thể tải danh sách môn thể thao.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setName("");
    setColor("#3b82f6");
    setIcon("Trophy");
    setStatus("true");
    setIsOpen(true);
  };

  const handleOpenEdit = (category: SportCategoryDto) => {
    setIsEditMode(true);
    setCurrentId(category.id);
    setName(category.name);
    setColor(category.color || "#3b82f6");
    setIcon(category.icon || "Trophy");
    setStatus(category.status ? "true" : "false");
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên môn thể thao.");
      return;
    }

    const payload = {
      name: name.trim(),
      color: color,
      icon: icon.trim(),
      status: status === "true",
    };

    try {
      if (isEditMode && currentId !== null) {
        await apiClient.put(`/api/SportCategories/${currentId}`, payload);
        toast.success("Cập nhật môn thể thao thành công!");
      } else {
        await apiClient.post("/api/SportCategories", payload);
        toast.success("Thêm môn thể thao thành công!");
      }
      setIsOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Failed to save sport category:", err);
      toast.error("Lỗi khi lưu thông tin môn thể thao.");
    }
  };

  const handleDeletePrompt = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (deleteId === null) return;
    try {
      await apiClient.delete(`/api/SportCategories/${deleteId}`);
      toast.success("Đã xóa môn thể thao thành công.");
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast.error("Lỗi khi xóa môn thể thao.");
    }
  };

  const table = useReactTable({
    data: categories,
    columns: categoriesColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    meta: {
      onEdit: handleOpenEdit,
      onDelete: handleDeletePrompt,
    },
    getRowId: (row) => String(row.id),
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

  const searchQuery = (table.getColumn("name")?.getFilterValue() as string) ?? "";
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <CardTitle className="text-xl leading-none">Danh mục Môn thể thao</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            Quản lý các môn thể thao được hỗ trợ đặt sân và ghép kèo trên toàn hệ thống.
          </CardDescription>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <InputGroup className="h-7 w-full md:w-64">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7"
                placeholder="Tìm kiếm môn thể thao..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("name")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>
            <Button variant="default" size="sm" onClick={handleOpenAdd}>
              <Plus className="size-4" /> Thêm mới
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground text-sm">
              Tổng số môn thể thao: <span className="font-semibold text-foreground">{categories.length}</span>
            </div>
            <div className="text-muted-foreground text-sm tabular-nums">
              Đã chọn {selectedCount} danh mục
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-muted-foreground">
              Đang tải danh sách môn thể thao...
            </div>
          ) : (
            <CategoriesTable table={table} />
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Cập nhật môn thể thao" : "Thêm môn thể thao mới"}</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết của môn thể thao để cấu hình trên ứng dụng.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="category-name">Tên môn thể thao</Label>
                <Input
                  id="category-name"
                  placeholder="Ví dụ: Cầu lông, Bóng đá, Pickleball..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="category-color">Mã màu đại diện</Label>
                  <div className="flex gap-2">
                    <Input
                      id="category-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-9 p-0.5 cursor-pointer shrink-0"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category-icon">Biểu tượng (Icon)</Label>
                  <Input
                    id="category-icon"
                    placeholder="Tên icon (ví dụ: Trophy)"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="category-status">Trạng thái hoạt động</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="category-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      <SelectItem value="true">Hoạt động</SelectItem>
                      <SelectItem value="false">Tạm ngưng</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit">
                Lưu thông tin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa môn thể thao này khỏi hệ thống? Hành động này không thể hoàn tác và có thể ảnh hưởng đến dữ liệu sân thuộc môn thể thao này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>
              Xóa vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
