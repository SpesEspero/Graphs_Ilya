import React from "react";
import { Layout, Typography, Button, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import authStore from "../store/authStore";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authStore.signOut();
  };

  // Определяем, какая страница активна
  const isDashboardActive =
    !location.pathname.includes("/create-graph") &&
    !location.pathname.includes("/graph/");
  const isCreateActive = location.pathname.includes("/create-graph");

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#1677ff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "white",
            marginRight: 24,
          }}
        >
          Оптимальные пути в сетях
        </Text>

        <Space size={16}>
          <Button
            type="text"
            icon={<AppstoreOutlined />}
            onClick={() => navigate("/dashboard")}
            style={{
              color: isDashboardActive ? "#fff" : "rgba(255, 255, 255, 0.65)",
              borderBottom: isDashboardActive ? "2px solid white" : "none",
              fontWeight: isDashboardActive ? "bold" : "normal",
              paddingBottom: isDashboardActive ? 5 : 7,
              borderRadius: 0,
            }}
          >
            Мои графы
          </Button>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => navigate("/create-graph")}
            style={{
              color: isCreateActive ? "#fff" : "rgba(255, 255, 255, 0.65)",
              borderBottom: isCreateActive ? "2px solid white" : "none",
              fontWeight: isCreateActive ? "bold" : "normal",
              paddingBottom: isCreateActive ? 5 : 7,
              borderRadius: 0,
            }}
          >
            Создать новый
          </Button>
        </Space>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <UserOutlined style={{ color: "white", marginRight: 8 }} />
        <Text style={{ color: "white", marginRight: 16 }}>
          {authStore.username}
        </Text>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ color: "white" }}
        >
          Выйти
        </Button>
      </div>
    </Header>
  );
});

export default AppHeader;
