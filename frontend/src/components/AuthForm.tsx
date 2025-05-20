import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined, IdcardOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import authStore from "../store/authStore";

const { Title } = Typography;

interface AuthFormProps {
  mode: "signin" | "signup";
  onToggleMode: () => void;
}

interface SignInFormValues {
  username: string;
  password: string;
}

interface SignUpFormValues extends SignInFormValues {
  name: string;
  confirmPassword: string;
}

const AuthForm: React.FC<AuthFormProps> = observer(({ mode, onToggleMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: SignInFormValues | SignUpFormValues) => {
    setLoading(true);
    setError(null);

    try {
      let success;

      if (mode === "signin") {
        success = await authStore.signIn({
          login: values.username,
          password: values.password,
        });
      } else {
        const signUpValues = values as SignUpFormValues;

        if (signUpValues.password !== signUpValues.confirmPassword) {
          setError("Пароли не совпадают");
          setLoading(false);
          return;
        }

        success = await authStore.signUp({
          login: signUpValues.username,
          name: signUpValues.name,
          password: signUpValues.password,
        });
      }

      if (!success && authStore.error) {
        setError(authStore.error);
      }
    } catch {
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="auth-card"
      style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
        {mode === "signin" ? "Вход в систему" : "Регистрация"}
      </Title>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form name="auth-form" onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          rules={[
            { required: true, message: "Пожалуйста, введите имя пользователя" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Логин" size="large" />
        </Form.Item>

        {mode === "signup" && (
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Пожалуйста, введите ваше имя" },
            ]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Имя" size="large" />
          </Form.Item>
        )}

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Пожалуйста, введите пароль" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Пароль"
            size="large"
          />
        </Form.Item>

        {mode === "signup" && (
          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: "Пожалуйста, подтвердите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Подтвердите пароль"
              size="large"
            />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%" }}
            size="large"
          >
            {mode === "signin" ? "Войти" : "Зарегистрироваться"}
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Button type="link" onClick={onToggleMode}>
            {mode === "signin" ? "Регистрация" : "Войти"}
          </Button>
        </div>
      </Form>
    </Card>
  );
});

export default AuthForm;
