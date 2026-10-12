
import { useState } from "react";

interface LoginProps {
  onLogin: (token: string, userName: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (isRegister && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";

      const response = await fetch(
        `https://san-task8-service-booking.onrender.com/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isRegister
              ? {
                  name: name.trim(),
                  email: email.trim(),
                  password,
                }
              : {
                  email: email.trim(),
                  password,
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      if (isRegister) {
        setIsRegister(false);
        setError("Registration successful. Please log in.");
        setPassword("");
        return;
      }

      if (!data.token) {
        throw new Error(
          "Login did not return an authentication token."
        );
      }

      onLogin(
        data.token,
        data.user?.name || data.name || email.trim()
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "35px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 25px rgba(15, 23, 42, 0.08)",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "8px" }}>
          QuickBook
        </h1>

        <p style={{ textAlign: "center", color: "#64748b" }}>
          {isRegister
            ? "Create your account"
            : "Sign in to book a service"}
        </p>

        {isRegister && (
          <div style={{ marginTop: "22px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ marginTop: "22px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: "18px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <p
            role="alert"
            style={{
              marginTop: "18px",
              color: error.toLowerCase().includes("successful")
                ? "#15803d"
                : "#b91c1c",
              background: error.toLowerCase().includes("successful")
                ? "#f0fdf4"
                : "#fef2f2",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "24px",
            padding: "13px",
            background: loading ? "#94a3b8" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          {loading
            ? "Please wait..."
            : isRegister
              ? "Create Account"
              : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "22px" }}>
          {isRegister
            ? "Already have an account?"
            : "New to QuickBook?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            style={{
              border: "none",
              background: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "15px",
};

export default Login;