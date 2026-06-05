import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "SportConnect Admin",
  version: packageJson.version,
  copyright: `© ${currentYear}, SportConnect.`,
  meta: {
    title: "SportConnect Admin - Hệ thống quản lý sân thể thao và kết nối thể thao",
    description:
      "Hệ thống quản trị và vận hành nền tảng kết nối, đặt sân thể thao SportConnect.",
  },
};
