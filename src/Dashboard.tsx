
import { useCallback, useEffect, useState } from "react";

interface DashboardProps {
  customerName: string;
  token: string;
}

interface Booking {
  id: number;
  customer_name: string;
  phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  address?: string | null;
  customer_address?: string | null;
  location?: string | null;
  status: string;
  created_at?: string;
}

const API_URL =
  "https://san-task8-service-booking.onrender.com/api/bookings";

const services = [
  "Home Cleaning",
  "Computer Repair",
  "Car Wash",
  "Haircut",
];

function Dashboard({ customerName, token }: DashboardProps) {
  const displayName = customerName.trim() || "Customer";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!token) {
      setBookings([]);
      setLoading(false);
      setError("Please log in to view your bookings.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch bookings.");
      }

      const data = await response.json();

      if (!Array.isArray(data.bookings)) {
        throw new Error("Unexpected response from the server.");
      }

      const normalizedBookings: Booking[] = data.bookings.map(
        (item: Booking) => ({
          ...item,
          address: (
            item.address ||
            item.customer_address ||
            item.location ||
            ""
          ).trim(),
        })
      );

      setBookings(normalizedBookings);
    } catch (err) {
      console.error("Booking fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [token, fetchBookings]);

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status?.toLowerCase() === "pending"
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status?.toLowerCase() === "completed"
  ).length;

  const upcomingBooking =
    [...bookings]
      .filter((booking) => booking.status?.toLowerCase() !== "cancelled")
      .sort((a, b) => {
        const dateA = new Date(
          `${a.booking_date?.slice(0, 10)}T${a.booking_time || "00:00:00"}`
        ).getTime();

        const dateB = new Date(
          `${b.booking_date?.slice(0, 10)}T${b.booking_time || "00:00:00"}`
        ).getTime();

        return dateA - dateB;
      })[0] || null;

  const recentBookings = [...bookings]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  function formatDate(dateString: string) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  function formatTime(timeString: string) {
    if (!timeString) return "-";

    const parts = timeString.split(":");
    if (parts.length < 2) return timeString;

    let hours = Number(parts[0]);
    const minutes = parts[1];
    const modifier = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes} ${modifier}`;
  }

  function getServiceIcon(service: string) {
    switch (service) {
      case "Home Cleaning": return "🧹";
      case "Computer Repair": return "💻";
      case "Car Wash": return "🚗";
      case "Haircut": return "✂️";
      default: return "🛠️";
    }
  }

  function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case "completed": return "#166534";
      case "confirmed": return "#1d4ed8";
      case "cancelled": return "#b91c1c";
      default: return "#92400e";
    }
  }

  function getStatusBackground(status: string) {
    switch (status?.toLowerCase()) {
      case "completed": return "#dcfce7";
      case "confirmed": return "#dbeafe";
      case "cancelled": return "#fee2e2";
      default: return "#fef3c7";
    }
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <section style={welcomeStyle}>
          <div>
            <p style={eyebrowStyle}>SERVICE BOOKING DASHBOARD</p>
            <h1 style={welcomeHeadingStyle}>
              Welcome back, {displayName}! 👋
            </h1>
            <p style={welcomeTextStyle}>
              Manage your services and bookings from one place.
            </p>
          </div>

          <div style={nextBookingStyle}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>📅</div>
            <div style={{ color: "#bfdbfe", fontSize: 13 }}>
              Next Booking
            </div>
            <strong style={{ display: "block", marginTop: 5 }}>
              {upcomingBooking
                ? formatDate(upcomingBooking.booking_date)
                : "No booking"}
            </strong>
          </div>
        </section>

        {error && (
          <div style={errorStyle}>
            {error}
            <button
              type="button"
              onClick={fetchBookings}
              style={errorButtonStyle}
            >
              Try Again
            </button>
          </div>
        )}

        <section style={statsGridStyle}>
          <StatCard icon="📋" title="Total Bookings"
            value={loading ? "..." : String(totalBookings)}
            subtitle="All bookings" />
          <StatCard icon="⏳" title="Pending"
            value={loading ? "..." : String(pendingBookings)}
            subtitle="Awaiting service" />
          <StatCard icon="✅" title="Completed"
            value={loading ? "..." : String(completedBookings)}
            subtitle="Successfully completed" />
          <StatCard icon="⭐" title="Services"
            value={String(services.length)}
            subtitle="Available services" />
        </section>

        <div style={mainGridStyle}>
          <div>
            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <h2 style={headingStyle}>Upcoming Booking</h2>
                  <p style={mutedStyle}>Your next scheduled service</p>
                </div>

                {upcomingBooking && (
                  <span style={{
                    ...statusStyle,
                    color: getStatusColor(upcomingBooking.status),
                    background: getStatusBackground(upcomingBooking.status),
                  }}>
                    {upcomingBooking.status || "Pending"}
                  </span>
                )}
              </div>

              {loading ? (
                <div style={emptyStyle}>Loading booking...</div>
              ) : upcomingBooking ? (
                <div style={bookingHighlightStyle}>
                  <div style={serviceHeadingStyle}>
                    <div style={serviceIconStyle}>
                      {getServiceIcon(upcomingBooking.service)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 19 }}>
                        {upcomingBooking.service}
                      </h3>
                      <p style={mutedStyle}>Service booking</p>
                    </div>
                  </div>

                  <div style={infoGridStyle}>
                    <InfoBox icon="📅" label="Date"
                      value={formatDate(upcomingBooking.booking_date)} />
                    <InfoBox icon="🕐" label="Time"
                      value={formatTime(upcomingBooking.booking_time)} />
                    <InfoBox icon="📍" label="Address"
                      value={upcomingBooking.address || "Address not returned by API"} />
                  </div>
                </div>
              ) : (
                <div style={emptyStyle}>No bookings available yet.</div>
              )}
            </section>

            <section style={{ ...cardStyle, marginTop: 25 }}>
              <div style={sectionHeaderStyle}>
                <div>
                  <h2 style={headingStyle}>Recent Bookings</h2>
                  <p style={mutedStyle}>Your latest service activity</p>
                </div>
                <button
                  type="button"
                  onClick={fetchBookings}
                  disabled={loading}
                  style={{ ...refreshButtonStyle, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
                {loading ? (
                  <p style={mutedStyle}>Loading bookings...</p>
                ) : recentBookings.length === 0 ? (
                  <p style={mutedStyle}>No bookings found.</p>
                ) : (
                  recentBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      icon={getServiceIcon(booking.service)}
                      service={booking.service}
                      date={formatDate(booking.booking_date)}
                      time={formatTime(booking.booking_time)}
                      status={booking.status || "Pending"}
                      statusColor={getStatusColor(booking.status)}
                      statusBackground={getStatusBackground(booking.status)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          <div>
            <section style={cardStyle}>
              <h2 style={headingStyle}>Quick Actions</h2>
              <p style={mutedStyle}>Your service options</p>
              <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
                <ActionButton icon="➕" title="Book a Service"
                  subtitle="Create a new booking" primary />
                <ActionButton icon="📋" title="My Bookings"
                  subtitle="View booking history" />
                <ActionButton icon="🛠️" title="Available Services"
                  subtitle="Explore our services" />
              </div>
            </section>

            <section style={{ ...cardStyle, marginTop: 25 }}>
              <div style={sectionHeaderStyle}>
                <h2 style={headingStyle}>Notifications</h2>
                <span style={notificationCountStyle}>{pendingBookings}</span>
              </div>
              <div style={{ marginTop: 18, display: "grid", gap: 15 }}>
                {pendingBookings > 0 ? (
                  <Notification icon="🔔"
                    text={`${pendingBookings} booking(s) are currently pending.`}
                    time="Current" />
                ) : (
                  <Notification icon="✅"
                    text="You have no pending bookings." time="Current" />
                )}
                {completedBookings > 0 && (
                  <Notification icon="✅"
                    text={`${completedBookings} booking(s) completed successfully.`}
                    time="Current" />
                )}
              </div>
            </section>

            <section style={{ ...cardStyle, marginTop: 25 }}>
              <h2 style={headingStyle}>Customer Profile</h2>
              <div style={profileStyle}>
                <div style={avatarStyle}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong style={{ fontSize: 17 }}>{displayName}</strong>
                  <p style={mutedStyle}>Service Booking Customer</p>
                </div>
              </div>
              <div style={profileSummaryStyle}>
                👤 Regular customer
                <span style={{ display: "block", marginTop: 8 }}>
                  ⭐ {totalBookings} total bookings
                </span>
              </div>
            </section>
          </div>
        </div>

        <section style={{ ...cardStyle, marginTop: 25 }}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={headingStyle}>Booking Activity</h2>
              <p style={mutedStyle}>Your service activity overview</p>
            </div>
            <span style={{ color: "#2563eb", fontWeight: "bold" }}>
              Recent overview
            </span>
          </div>

          <div style={activityGridStyle}>
            {[
              { day: "Mon", height: "45%", value: "2" },
              { day: "Tue", height: "70%", value: "4" },
              { day: "Wed", height: "35%", value: "1" },
              { day: "Thu", height: "85%", value: "5" },
              { day: "Fri", height: "55%", value: "3" },
              { day: "Sat", height: "95%", value: "6" },
              { day: "Sun", height: "40%", value: "2" },
            ].map((item) => (
              <ActivityBar key={item.day} {...item} />
            ))}
          </div>
        </section>

        <p style={footerStyle}>
          ✨ Making service booking simple, fast and convenient.
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "calc(100vh - 75px)", background: "#f4f7fb",
  padding: "35px 20px 60px", fontFamily: "Arial, sans-serif", color: "#0f172a",
};
const containerStyle = { maxWidth: 1200, margin: "0 auto" };
const welcomeStyle = {
  background: "linear-gradient(135deg, #0f172a, #1d4ed8)", color: "white",
  borderRadius: 20, padding: 35, display: "flex", justifyContent: "space-between",
  alignItems: "center", gap: 25, flexWrap: "wrap" as const,
  boxShadow: "0 12px 35px rgba(15, 23, 42, 0.15)",
};
const eyebrowStyle = {
  margin: "0 0 8px", color: "#bfdbfe", fontSize: 14, fontWeight: "bold",
  letterSpacing: 1,
};
const welcomeHeadingStyle = { margin: 0, fontSize: 32, color: "#ffffff" };
const welcomeTextStyle = { margin: "12px 0 0", color: "#dbeafe", fontSize: 16 };
const nextBookingStyle = {
  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 16, padding: "20px 25px", minWidth: 190,
};
const errorStyle = {
  marginTop: 20, padding: 15, background: "#fee2e2", color: "#991b1b",
  borderRadius: 10, border: "1px solid #fecaca", display: "flex",
  justifyContent: "space-between", alignItems: "center", gap: 12,
  flexWrap: "wrap" as const,
};
const errorButtonStyle = {
  background: "#991b1b", color: "white", border: 0, padding: "8px 12px",
  borderRadius: 7, cursor: "pointer",
};
const statsGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 18, marginTop: 25,
};
const mainGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
  gap: 25, marginTop: 25,
};
const cardStyle = {
  background: "white", border: "1px solid #e2e8f0", borderRadius: 16,
  padding: 22, boxShadow: "0 5px 18px rgba(15, 23, 42, 0.05)",
};
const headingStyle = { margin: 0, fontSize: 21 };
const mutedStyle = { margin: "6px 0 0", color: "#64748b", fontSize: 13 };
const sectionHeaderStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  gap: 15, flexWrap: "wrap" as const,
};
const statusStyle = {
  padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold",
  textTransform: "uppercase" as const,
};
const emptyStyle = {
  marginTop: 22, padding: 30, textAlign: "center" as const,
  background: "#f8fafc", borderRadius: 14, color: "#64748b",
};
const bookingHighlightStyle = {
  marginTop: 22, background: "#f8fafc", borderRadius: 14, padding: 22,
  border: "1px solid #e2e8f0",
};
const serviceHeadingStyle = { display: "flex", alignItems: "center", gap: 15 };
const serviceIconStyle = {
  width: 55, height: 55, borderRadius: 14, background: "#eff6ff",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 27, flexShrink: 0,
};
const infoGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 15, marginTop: 22,
};
const refreshButtonStyle = {
  background: "#eff6ff", color: "#2563eb", border: "none", padding: "9px 14px",
  borderRadius: 8, fontWeight: "bold", cursor: "pointer",
};
const notificationCountStyle = {
  background: "#fee2e2", color: "#b91c1c", width: 26, height: 26,
  borderRadius: "50%", display: "flex", alignItems: "center",
  justifyContent: "center", fontSize: 12, fontWeight: "bold",
};
const profileStyle = { display: "flex", alignItems: "center", gap: 15, marginTop: 20 };
const avatarStyle = {
  width: 55, height: 55, borderRadius: "50%",
  background: "linear-gradient(135deg, #2563eb, #60a5fa)", color: "white",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 22, fontWeight: "bold", flexShrink: 0,
};
const profileSummaryStyle = {
  marginTop: 20, background: "#f8fafc", borderRadius: 10, padding: 14,
  fontSize: 14, color: "#475569",
};
const activityGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 10, alignItems: "end", height: 170, marginTop: 30,
};
const footerStyle = {
  textAlign: "center" as const, marginTop: 30, color: "#64748b", fontSize: 13,
};

function StatCard({ icon, title, value, subtitle }: {
  icon: string; title: string; value: string; subtitle: string;
}) {
  return (
    <div style={cardStyle}>
      <div style={sectionHeaderStyle}>
        <div style={serviceIconStyle}>{icon}</div>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>Overview</span>
      </div>
      <h2 style={{ margin: "18px 0 4px", fontSize: 30 }}>{value}</h2>
      <strong style={{ fontSize: 14 }}>{title}</strong>
      <p style={mutedStyle}>{subtitle}</p>
    </div>
  );
}

function InfoBox({ icon, label, value }: {
  icon: string; label: string; value: string;
}) {
  return (
    <div style={{
      background: "white", border: "1px solid #e2e8f0", borderRadius: 10,
      padding: 13, minWidth: 0,
    }}>
      <div style={{ fontSize: 17 }}>{icon}</div>
      <div style={{ marginTop: 6, color: "#64748b", fontSize: 12 }}>{label}</div>
      <strong style={{
        display: "block", marginTop: 3, fontSize: 14, wordBreak: "break-word",
      }}>{value}</strong>
    </div>
  );
}

function BookingRow({ icon, service, date, time, status, statusColor, statusBackground }: {
  icon: string; service: string; date: string; time: string; status: string;
  statusColor: string; statusBackground: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 15, padding: 15, background: "#f8fafc", borderRadius: 12,
      border: "1px solid #e2e8f0", flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{
          ...serviceIconStyle, width: 42, height: 42, borderRadius: 10, fontSize: 20,
        }}>{icon}</div>
        <div>
          <strong style={{ display: "block", fontSize: 14 }}>{service}</strong>
          <span style={{ color: "#64748b", fontSize: 12 }}>{date} • {time}</span>
        </div>
      </div>
      <span style={{ ...statusStyle, color: statusColor, background: statusBackground }}>
        {status}
      </span>
    </div>
  );
}

function ActionButton({ icon, title, subtitle, primary = false }: {
  icon: string; title: string; subtitle: string; primary?: boolean;
}) {
  return (
    <div style={{
      width: "100%", boxSizing: "border-box",
      border: primary ? "none" : "1px solid #e2e8f0",
      background: primary ? "#2563eb" : "#f8fafc",
      color: primary ? "white" : "#0f172a", padding: 14, borderRadius: 11,
      display: "flex", alignItems: "center", gap: 13,
    }}>
      <span style={{
        width: 38, height: 38, borderRadius: 9,
        background: primary ? "rgba(255,255,255,0.15)" : "#eff6ff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>{icon}</span>
      <span>
        <strong style={{ display: "block", fontSize: 14 }}>{title}</strong>
        <small style={{
          display: "block", marginTop: 3, color: primary ? "#dbeafe" : "#64748b",
        }}>{subtitle}</small>
      </span>
    </div>
  );
}

function Notification({ icon, text, time }: {
  icon: string; text: string; time: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{
        width: 35, height: 35, borderRadius: 9, background: "#eff6ff",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{text}</p>
        <small style={{ display: "block", marginTop: 4, color: "#94a3b8" }}>
          {time}
        </small>
      </div>
    </div>
  );
}

function ActivityBar({ day, height, value }: {
  day: string; height: string; value: string;
}) {
  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      justifyContent: "flex-end", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 11, color: "#64748b" }}>{value}</span>
      <div style={{
        width: "100%", maxWidth: 55, height, minHeight: 25,
        background: "linear-gradient(to top, #2563eb, #60a5fa)",
        borderRadius: "8px 8px 3px 3px",
      }} />
      <span style={{ fontSize: 11, color: "#64748b" }}>{day}</span>
    </div>
  );
}

export default Dashboard;
