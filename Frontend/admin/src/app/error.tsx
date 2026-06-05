"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error("Runtime error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6 bg-muted/40 text-center">
      <div className="w-full max-w-md p-8 rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
          Đã xảy ra lỗi hệ thống
        </h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Hệ thống gặp sự cố không mong muốn khi tải trang này. Bạn vui lòng thử tải lại hoặc quay về Dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link prefetch={false} replace href="/dashboard/default">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
