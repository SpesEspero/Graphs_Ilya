import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { observer } from "mobx-react-lite";
import { ConfigProvider, theme, Layout, App as AntdApp } from "antd";
import ruRU from "antd/locale/ru_RU";

// Components
import AppHeader from "./components/AppHeader";

// Pages
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import CreateGraphPage from "./pages/CreateGraphPage";
import ViewGraphPage from "./pages/ViewGraphPage";

// Store
import authStore from "./store/authStore";

const { Content } = Layout;

// Layout with Header for authorized users
const ProtectedLayout = () => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "20px 50px" }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

const App: React.FC = observer(() => {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
        <Router>
          <Routes>
            <Route
              path="/auth"
              element={
                authStore.isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <AuthPage />
                )
              }
            />

            {/* Protected routes with common header */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/create-graph" element={<CreateGraphPage />} />
              <Route path="/graph/:graphId" element={<ViewGraphPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
});

export default App;
