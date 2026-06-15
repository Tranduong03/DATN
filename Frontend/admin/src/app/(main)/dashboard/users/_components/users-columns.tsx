"use client";
"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { parseISO, format } from "date-fns";
import { MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

export type UserListItem = {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: boolean;
  trustScore: number;
  createdAt: string;
  roles: string[];
};

function StatusBadge({ status }: { status: boolean }) {
  return (
    <Badge
      className={cn(
        "gap-1.5 border px-2 py-1 font-medium",
        status
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      )}
      variant="outline"
    >
      <span className={cn("size-1.5 rounded-full", status ? "bg-emerald-500" : "bg-destructive")} />
      {status ? "Hoạt động" : "Bị khóa"}
    </Badge>
  );
}

export const usersColumns: ColumnDef<UserListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all users"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label={`Select ${row.original.fullName || row.original.username}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "search",
    accessorFn: (row) => `${row.fullName || ""} ${row.username} ${row.email}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "fullName",
    header: "Người dùng",
    cell: ({ row }) => {
      const name = row.original.fullName || row.original.username;
      const avatarUrl = row.original.avatarUrl;
      return (
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="font-medium bg-muted">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="size-full object-cover rounded-full" />
            ) : (
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground text-sm">{name}</div>
            <div className="truncate text-muted-foreground text-sm">{row.original.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => <div className="text-sm">{row.original.phone || "Chưa cập nhật"}</div>,
  },
  {
    accessorKey: "roles",
    header: "Vai trò",
    cell: ({ row }) => {
      const roles = row.original.roles || [];
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <Badge key={role} variant="secondary" className="text-xs">
              {role === "Admin" ? "Quản trị viên" : role === "Owner" ? "Chủ sân" : "Người chơi"}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "trustScore",
    header: "Điểm uy tín",
    cell: ({ row }) => (
      <Badge className="font-mono" variant="outline">
        {row.original.trustScore} / 100
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "createdAt",
    accessorFn: (row) => new Date(row.createdAt).getTime(),
    header: "Ngày tham gia",
    cell: ({ row }) => {
      try {
        const date = parseISO(row.original.createdAt);
        return <div className="text-foreground text-sm">{format(date, "dd/MM/yyyy")}</div>;
      } catch {
        return <div className="text-foreground text-sm">{row.original.createdAt}</div>;
      }
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Hành động</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const name = row.original.fullName || row.original.username;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={`Open actions for ${name}`}
                className="size-8 rounded-md text-muted-foreground hover:bg-muted/50"
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => meta?.onToggleStatus(row.original.id)}>
                {row.original.status ? "Khóa tài khoản" : "Mở khóa tài khoản"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => meta?.onEditRoles(row.original)}>
                Phân quyền vai trò
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
];
