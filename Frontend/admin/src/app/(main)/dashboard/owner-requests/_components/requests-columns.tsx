"use client";
"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { parseISO, format } from "date-fns";
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";

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
import type { OwnerRequestDto } from "./owner-requests";

function StatusBadge({ status }: { status: string }) {
  let badgeClass = "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  let dotClass = "bg-amber-500";
  let text = "Đang chờ";

  if (status === "Verified") {
    badgeClass = "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    dotClass = "bg-emerald-500";
    text = "Đã duyệt";
  } else if (status === "Rejected") {
    badgeClass = "border-destructive/20 bg-destructive/10 text-destructive";
    dotClass = "bg-destructive";
    text = "Từ chối";
  }

  return (
    <Badge className={cn("gap-1.5 border px-2 py-1 font-medium", badgeClass)} variant="outline">
      <span className={cn("size-1.5 rounded-full", dotClass)} />
      {text}
    </Badge>
  );
}

export const requestsColumns: ColumnDef<OwnerRequestDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all requests"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label={`Select request from ${row.original.fullName || row.original.username}`}
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
    accessorFn: (row) => `${row.fullName || ""} ${row.username} ${row.email} ${row.venueName || ""}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "fullName",
    header: "Người gửi",
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
    accessorKey: "venueName",
    header: "Sân thể thao đề xuất",
    cell: ({ row }) => (
      <div className="grid gap-0.5 max-w-[280px]">
        <div className="truncate font-medium text-foreground text-sm">
          {row.original.venueName || "Chưa thiết lập"}
        </div>
        <div className="truncate text-muted-foreground text-xs">
          {row.original.venueAddress || "Chưa có địa chỉ"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "submittedAt",
    header: "Ngày gửi yêu cầu",
    cell: ({ row }) => {
      try {
        const date = parseISO(row.original.submittedAt);
        return <div className="text-foreground text-sm">{format(date, "dd/MM/yyyy HH:mm")}</div>;
      } catch {
        return <div className="text-foreground text-sm">{row.original.submittedAt}</div>;
      }
    },
  },
  {
    accessorKey: "verificationStatus",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.original.verificationStatus} />,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Hành động</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const name = row.original.fullName || row.original.username;
      const isPending = row.original.verificationStatus === "Pending";

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
              <DropdownMenuItem onClick={() => meta?.onViewDetails(row.original)}>
                <Eye className="mr-2 size-4" /> Xem chi tiết
              </DropdownMenuItem>
              {isPending && (
                <>
                  <DropdownMenuItem onClick={() => meta?.onApprove(row.original.userId)}>
                    <CheckCircle className="mr-2 size-4 text-emerald-500" /> Phê duyệt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.onReject(row.original.userId)}>
                    <XCircle className="mr-2 size-4 text-destructive" /> Từ chối
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
];
