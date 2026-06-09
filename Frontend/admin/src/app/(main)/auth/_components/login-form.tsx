"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client";

const formSchema = z.object({
  username: z.string().min(2, { message: "Tên đăng nhập phải có ít nhất 2 ký tự." }),
  password: z.string().min(4, { message: "Mật khẩu phải có ít nhất 4 ký tự." }),
  adminKey: z.string().min(1, { message: "Mã Admin Key là bắt buộc." }),
});

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      adminKey: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.post("/api/auth/admin-login", {
        username: data.username,
        password: data.password,
        adminKey: data.adminKey,
      });

      if (res && res.token) {
        localStorage.setItem("adminToken", res.token);
        localStorage.setItem("adminRefreshToken", res.refreshToken);
        toast.success("Đăng nhập thành công!", {
          description: "Chào mừng bạn quay trở lại trang quản trị SportConnect.",
        });
        router.push("/dashboard/default");
      } else {
        toast.error("Đăng nhập thất bại", {
          description: "Không thể lấy mã Token xác thực từ máy chủ.",
        });
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errMsg = error.response?.data?.message || "Thông tin đăng nhập hoặc Admin Key không chính xác.";
      toast.error("Lỗi đăng nhập", {
        description: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-username">Tên đăng nhập</FieldLabel>
              <Input
                {...field}
                id="login-username"
                type="text"
                placeholder="admin"
                autoComplete="username"
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
              <Input
                {...field}
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="adminKey"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-adminkey">Admin Secret Key</FieldLabel>
              <Input
                {...field}
                id="login-adminkey"
                type="password"
                placeholder="Nhập mã Admin Key"
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Đang xác thực..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
