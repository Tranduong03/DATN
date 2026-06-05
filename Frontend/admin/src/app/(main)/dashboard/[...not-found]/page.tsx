"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md p-8 rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
          Không tìm thấy trang
        </h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Đường dẫn trong bảng điều khiển bạn đang tìm kiếm không tồn tại hoặc tính năng này đang được phát triển.
        </p>

        <div className="flex justify-center">
          <Button asChild variant="default">
            <Link prefetch={false} replace href="/dashboard/default">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại Tổng quan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
