import {
  Building2,
  Fingerprint,
  LayoutDashboard,
  type LucideIcon,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Hệ thống",
    items: [
      {
        title: "Tổng quan",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Quản lý",
    items: [
      {
        title: "Người dùng",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Yêu cầu Owner",
        url: "/dashboard/owner-requests",
        icon: UserCheck,
      },
      {
        title: "Cơ sở sân",
        url: "/dashboard/venues",
        icon: Building2,
      },
      {
        title: "Môn thể thao",
        url: "/dashboard/sport-categories",
        icon: Trophy,
      },
    ],
  },
  {
    id: 3,
    label: "Hệ thống khác",
    items: [
      {
        title: "Xác thực (Demo)",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Đăng nhập v1", url: "/auth/v1/login", newTab: true },
          { title: "Đăng nhập v2", url: "/auth/v2/login", newTab: true },
        ],
      },
    ],
  },
];
