"use client";
"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SportCategoryDto } from "./categories";

export const categoriesColumns: ColumnDef<SportCategoryDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all categories"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label={`Select category ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "id",
    header: "Mã",
    cell: ({ row }) => <span className="font-mono text-muted-foreground text-xs">#{row.original.id}</span>,
  },
  {
    accessorKey: "name",
    header: "Tên môn thể thao",
    cell: ({ row }) => {
      const color = row.original.color || "#cccccc";
      return (
        <div className="flex items-center gap-2.5">
          <span
            className="size-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <div className="font-medium text-foreground text-sm">{row.original.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "icon",
    header: "Biểu tượng (Icon)",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground text-xs">{row.original.icon || "Default"}</span>
    ),
  },
  {
    accessorKey: "color",
    header: "Mã màu",
    cell: ({ row }) => (
      <span className="font-mono text-foreground text-xs">{row.original.color}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.original.status;
      return (
        <Badge
          className={cn(
            "gap-1 border px-2 py-0.5 text-xs font-medium",
            isActive
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          )}
          variant="outline"
        >
          <span className={cn("size-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-destructive")} />
          {isActive ? "Hoạt động" : "Tạm ngưng"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Hành động</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const name = row.original.name;

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
              <DropdownMenuItem onClick={() => meta?.onEdit(row.original)}>
                <Edit className="mr-2 size-4" /> Sửa thông tin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => meta?.onDelete(row.original.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 size-4" /> Xóa danh mục
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
