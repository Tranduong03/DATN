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
import { Download, Grid, Plus, Rows3, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api-client";

import { usersColumns, type UserListItem } from "./users-columns";
import { UsersTable } from "./users-table";

const roleFilterOptions = [
  { label: "Tất cả vai trò", value: "All" },
  { label: "Quản trị viên", value: "Admin" },
  { label: "Chủ sân", value: "Owner" },
  { label: "Người chơi", value: "Player" },
];

const statusFilterOptions = [
  { label: "Tất cả trạng thái", value: "All" },
  { label: "Hoạt động", value: "Hoạt động" },
  { label: "Bị khóa", value: "Bị khóa" },
];

export function Users() {
  const [users, setUsers] = React.useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    search: false,
  });
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get("/api/admin/users?pageSize=200");
      if (res && res.isSuccess && res.data) {
        setUsers(res.data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Không thể tải danh sách người dùng.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId: string) => {
    try {
      const res: any = await apiClient.post(`/api/admin/users/${userId}/toggle-status`);
      if (res && res.isSuccess) {
        toast.success("Cập nhật trạng thái tài khoản thành công!");
        fetchUsers();
      } else {
        toast.error("Không thể cập nhật trạng thái.");
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      toast.error("Lỗi khi cập nhật trạng thái tài khoản.");
    }
  };

  const table = useReactTable({
    data: users,
    columns: usersColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    meta: {
      onToggleStatus: handleToggleStatus,
    },
    getRowId: (row) => row.id,
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
  const roleFilterValue = (table.getColumn("roles")?.getFilterValue() as string) ?? "All";
  const statusFilterValue = (table.getColumn("status")?.getFilterValue() as string) ?? "All";
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  function setColumnSelectFilter(columnId: string, value: string) {
    if (value === "All") {
      table.getColumn(columnId)?.setFilterValue(undefined);
    } else {
      table.getColumn(columnId)?.setFilterValue(value);
    }
    table.setPageIndex(0);
  }

  return (
    <Card>
      <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <CardTitle className="text-xl leading-none">Người dùng</CardTitle>
        <CardDescription className="max-w-sm leading-snug">
          Quản lý người dùng, vai trò và trạng thái tài khoản trên hệ thống.
        </CardDescription>
        <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
          <InputGroup className="h-7 w-full md:w-64">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-7"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </InputGroup>
          <Button variant="outline" size="sm">
            <Download /> Xuất Excel
          </Button>
          <Button size="sm">
            <Plus /> Thêm Admin
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={roleFilterValue} onValueChange={(value) => setColumnSelectFilter("roles", value)}>
              <SelectTrigger size="sm">
                <span className="text-muted-foreground">Vai trò:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {roleFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={statusFilterValue} onValueChange={(value) => {
              if (value === "All") {
                table.getColumn("status")?.setFilterValue(undefined);
              } else {
                // "Hoạt động" maps to true, "Bị khóa" maps to false
                table.getColumn("status")?.setFilterValue(value === "Hoạt động");
              }
              table.setPageIndex(0);
            }}>
              <SelectTrigger size="sm">
                <span className="text-muted-foreground">Trạng thái:</span>
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
        </div>

        <div className="flex items-center justify-between gap-3 px-4">
          <div className="text-muted-foreground text-sm tabular-nums">Đã chọn {selectedCount} người dùng</div>

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list" aria-label="List view">
                <Rows3 />
              </TabsTrigger>
              <TabsTrigger value="grid" aria-label="Grid view">
                <Grid />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-muted-foreground">
            Đang tải danh sách người dùng...
          </div>
        ) : (
          <UsersTable table={table} />
        )}
      </CardContent>
    </Card>
  );
}
