import React, { useState } from "react";
import { Layout, Typography } from "antd";
import { observer } from "mobx-react-lite";
import AuthForm from "../components/AuthForm";

const { Content } = Layout;
const { Title } = Typography;

const AuthPage: React.FC = observer(() => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const toggleAuthMode = () => {
    setAuthMode((prevMode) => (prevMode === "signin" ? "signup" : "signin"));
  };

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Content
        style={{
          padding: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Title>Оптимальные пути в сетях</Title>
        </div>

        <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
      </Content>
    </Layout>
  );
});

export default AuthPage;
