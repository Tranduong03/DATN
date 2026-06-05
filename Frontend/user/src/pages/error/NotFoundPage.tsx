import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 120px)",
          padding: "24px",
          textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
          color: "var(--text-main)",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(50, 100, 65, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            border: "2px dashed var(--primary-color)",
          }}
        >
          <AlertTriangle size={40} color="var(--primary-color)" />
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--text-green)",
            marginBottom: "12px",
          }}
        >
          404 - Không tìm thấy trang
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-muted)",
            lineHeight: "1.6",
            marginBottom: "32px",
            maxWidth: "320px",
          }}
        >
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi trong hệ thống.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            backgroundColor: "var(--primary-color)",
            color: "white",
            border: "none",
            borderRadius: "30px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(50, 100, 65, 0.2)",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-hover)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-color)";
          }}
        >
          <Home size={18} />
          Quay lại Trang chủ
        </button>
      </div>
    </MainLayout>
  );
}
