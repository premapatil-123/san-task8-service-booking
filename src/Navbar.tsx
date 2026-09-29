type NavbarProps = {
  onDashboard: () => void;
  onHome: () => void;
};

function Navbar({ onDashboard, onHome }: NavbarProps) {
  return (
    <nav
      style={{
        width: "100%",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* LOGO */}

        <button
          onClick={onHome}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "21px",
                fontWeight: "bold",
              }}
            >
              S
            </div>

            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#111827",
                  lineHeight: 1.1,
                }}
              >
                ServiceBook
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  marginTop: "3px",
                }}
              >
                Smart Service Booking
              </div>
            </div>
          </div>
        </button>

        {/* NAVIGATION */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onHome}
            style={navButtonStyle}
          >
            🏠 Home
          </button>

          <button
            onClick={onHome}
            style={{
              ...navButtonStyle,
              background: "#eff6ff",
              color: "#2563eb",
            }}
          >
            📅 Book Service
          </button>

          <button
            onClick={onDashboard}
            style={{
              ...navButtonStyle,
              background: "#2563eb",
              color: "#ffffff",
            }}
          >
            📊 Dashboard
          </button>
        </div>
      </div>
    </nav>
  );
}

const navButtonStyle = {
  border: "none",
  padding: "10px 14px",
  borderRadius: "9px",
  background: "transparent",
  color: "#475569",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

export default Navbar;