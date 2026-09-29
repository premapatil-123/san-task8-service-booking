import { useEffect, useState } from "react";

interface DashboardProps {
  customerName: string;
}

interface Booking {
  id: number;
  customer_name: string;
  phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  address: string;
  status: string;
  created_at?: string;
}

const services = [
  "Home Cleaning",
  "Computer Repair",
  "Car Wash",
  "Haircut",
];

function Dashboard({ customerName }: DashboardProps) {
  const displayName =
    customerName.trim() || "Customer";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://san-task8-service-booking.onrender.com"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();

      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load booking data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "Completed"
  ).length;

  const upcomingBooking =
    bookings.length > 0 ? bookings[0] : null;

  const recentBookings = bookings.slice(0, 5);

  function formatDate(dateString: string) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(timeString: string) {
    if (!timeString) return "-";

    const parts = timeString.split(":");

    if (parts.length < 2) {
      return timeString;
    }

    let hours = Number(parts[0]);
    const minutes = parts[1];

    const modifier = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${hours}:${minutes} ${modifier}`;
  }

  function getServiceIcon(service: string) {
    switch (service) {
      case "Home Cleaning":
        return "🧹";

      case "Computer Repair":
        return "💻";

      case "Car Wash":
        return "🚗";

      case "Haircut":
        return "✂️";

      default:
        return "🛠️";
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "Completed":
        return "#166534";

      case "Confirmed":
        return "#1d4ed8";

      case "Cancelled":
        return "#b91c1c";

      case "Pending":
      default:
        return "#92400e";
    }
  }

  function getStatusBackground(status: string) {
    switch (status) {
      case "Completed":
        return "#dcfce7";

      case "Confirmed":
        return "#dbeafe";

      case "Cancelled":
        return "#fee2e2";

      case "Pending":
      default:
        return "#fef3c7";
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 75px)",
        background: "#f4f7fb",
        padding: "35px 20px 60px",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* WELCOME HEADER */}

        <section
          style={{
            background:
              "linear-gradient(135deg, #0f172a, #1d4ed8)",
            color: "white",
            borderRadius: "20px",
            padding: "35px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "25px",
            flexWrap: "wrap",
            boxShadow:
              "0 12px 35px rgba(15, 23, 42, 0.15)",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "#bfdbfe",
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              SERVICE BOOKING DASHBOARD
            </p>

            {/* FIXED TITLE COLOR */}

            <h1
              style={{
                margin: 0,
                fontSize: "34px",
                color: "#ffffff",
              }}
            >
              Welcome back, {displayName}! 👋
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                color: "#dbeafe",
                fontSize: "16px",
              }}
            >
              Manage your services and bookings from one
              place.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "16px",
              padding: "20px 25px",
              minWidth: "190px",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                marginBottom: "8px",
              }}
            >
              📅
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#bfdbfe",
              }}
            >
              Next Booking
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "16px",
              }}
            >
              {upcomingBooking
                ? formatDate(upcomingBooking.booking_date)
                : "No booking"}
            </strong>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "10px",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "18px",
            marginTop: "25px",
          }}
        >
          <StatCard
            icon="📋"
            title="Total Bookings"
            value={
              loading
                ? "..."
                : String(totalBookings)
            }
            subtitle="All bookings"
          />

          <StatCard
            icon="⏳"
            title="Pending"
            value={
              loading
                ? "..."
                : String(pendingBookings)
            }
            subtitle="Awaiting service"
          />

          <StatCard
            icon="✅"
            title="Completed"
            value={
              loading
                ? "..."
                : String(completedBookings)
            }
            subtitle="Successfully completed"
          />

          <StatCard
            icon="⭐"
            title="Services"
            value={String(services.length)}
            subtitle="Available services"
          />
        </section>

        {/* MAIN GRID */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 2fr) minmax(280px, 1fr)",
            gap: "25px",
            marginTop: "25px",
          }}
        >
          {/* LEFT */}

          <div>
            {/* UPCOMING BOOKING */}

            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <h2 style={headingStyle}>
                    Upcoming Booking
                  </h2>

                  <p style={mutedStyle}>
                    Your next scheduled service
                  </p>
                </div>

                {upcomingBooking && (
                  <span
                    style={{
                      background:
                        getStatusBackground(
                          upcomingBooking.status
                        ),
                      color:
                        getStatusColor(
                          upcomingBooking.status
                        ),
                      padding: "7px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {upcomingBooking.status.toUpperCase()}
                  </span>
                )}
              </div>

              {loading ? (
                <div
                  style={{
                    marginTop: "22px",
                    padding: "30px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Loading booking...
                </div>
              ) : upcomingBooking ? (
                <div
                  style={{
                    marginTop: "22px",
                    background: "#f8fafc",
                    borderRadius: "14px",
                    padding: "22px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "14px",
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "27px",
                      }}
                    >
                      {getServiceIcon(
                        upcomingBooking.service
                      )}
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "19px",
                        }}
                      >
                        {upcomingBooking.service}
                      </h3>

                      <p
                        style={{
                          margin: "5px 0 0",
                          color: "#64748b",
                        }}
                      >
                        Service booking
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "15px",
                      marginTop: "22px",
                    }}
                  >
                    <InfoBox
                      icon="📅"
                      label="Date"
                      value={formatDate(
                        upcomingBooking.booking_date
                      )}
                    />

                    <InfoBox
                      icon="🕐"
                      label="Time"
                      value={formatTime(
                        upcomingBooking.booking_time
                      )}
                    />

                    <InfoBox
                      icon="📍"
                      label="Address"
                      value={
                        upcomingBooking.address
                      }
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: "22px",
                    padding: "30px",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: "14px",
                    color: "#64748b",
                  }}
                >
                  No bookings available.
                </div>
              )}
            </section>

            {/* RECENT BOOKINGS */}

            <section
              style={{
                ...cardStyle,
                marginTop: "25px",
              }}
            >
              <div style={sectionHeaderStyle}>
                <div>
                  <h2 style={headingStyle}>
                    Recent Bookings
                  </h2>

                  <p style={mutedStyle}>
                    Your latest service activity
                  </p>
                </div>

                <button
                  onClick={fetchBookings}
                  style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "none",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Refresh
                </button>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "grid",
                  gap: "12px",
                }}
              >
                {loading ? (
                  <p
                    style={{
                      color: "#64748b",
                    }}
                  >
                    Loading bookings...
                  </p>
                ) : recentBookings.length === 0 ? (
                  <p
                    style={{
                      color: "#64748b",
                    }}
                  >
                    No bookings found.
                  </p>
                ) : (
                  recentBookings.map(
                    (booking) => (
                      <BookingRow
                        key={booking.id}
                        icon={getServiceIcon(
                          booking.service
                        )}
                        service={booking.service}
                        date={formatDate(
                          booking.booking_date
                        )}
                        time={formatTime(
                          booking.booking_time
                        )}
                        status={booking.status}
                        statusColor={getStatusColor(
                          booking.status
                        )}
                        statusBackground={getStatusBackground(
                          booking.status
                        )}
                      />
                    )
                  )
                )}
              </div>
            </section>
          </div>

          {/* RIGHT */}

          <div>
            {/* QUICK ACTIONS */}

            <section style={cardStyle}>
              <h2 style={headingStyle}>
                Quick Actions
              </h2>

              <p style={mutedStyle}>
                Get things done quickly
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                <ActionButton
                  icon="➕"
                  title="Book a Service"
                  subtitle="Create a new booking"
                  primary
                />

                <ActionButton
                  icon="📋"
                  title="My Bookings"
                  subtitle="View booking history"
                />

                <ActionButton
                  icon="🛠️"
                  title="Available Services"
                  subtitle="Explore our services"
                />
              </div>
            </section>

            {/* NOTIFICATIONS */}

            <section
              style={{
                ...cardStyle,
                marginTop: "25px",
              }}
            >
              <div style={sectionHeaderStyle}>
                <h2 style={headingStyle}>
                  Notifications
                </h2>

                <span
                  style={{
                    background: "#fee2e2",
                    color: "#b91c1c",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {pendingBookings}
                </span>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  display: "grid",
                  gap: "15px",
                }}
              >
                {pendingBookings > 0 ? (
                  <Notification
                    icon="🔔"
                    text={`${pendingBookings} booking(s) are currently pending.`}
                    time="Current"
                  />
                ) : (
                  <Notification
                    icon="✅"
                    text="You have no pending bookings."
                    time="Current"
                  />
                )}

                {completedBookings > 0 && (
                  <Notification
                    icon="✅"
                    text={`${completedBookings} booking(s) completed successfully.`}
                    time="Current"
                  />
                )}
              </div>
            </section>

            {/* PROFILE */}

            <section
              style={{
                ...cardStyle,
                marginTop: "25px",
              }}
            >
              <h2 style={headingStyle}>
                Customer Profile
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #2563eb, #60a5fa)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: "bold",
                  }}
                >
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong
                    style={{
                      fontSize: "17px",
                    }}
                  >
                    {displayName}
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Service Booking Customer
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "14px",
                  color: "#475569",
                }}
              >
                👤 Regular customer
                <br />

                <span
                  style={{
                    display: "block",
                    marginTop: "8px",
                  }}
                >
                  ⭐ {totalBookings} total
                  bookings
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* ACTIVITY */}

        <section
          style={{
            ...cardStyle,
            marginTop: "25px",
          }}
        >
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={headingStyle}>
                Booking Activity
              </h2>

              <p style={mutedStyle}>
                Your service activity overview
              </p>
            </div>

            <span
              style={{
                color: "#2563eb",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              This Month
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(7, 1fr)",
              gap: "10px",
              alignItems: "end",
              height: "170px",
              marginTop: "30px",
            }}
          >
            <ActivityBar
              day="Mon"
              height="45%"
              value="2"
            />

            <ActivityBar
              day="Tue"
              height="70%"
              value="4"
            />

            <ActivityBar
              day="Wed"
              height="35%"
              value="1"
            />

            <ActivityBar
              day="Thu"
              height="85%"
              value="5"
            />

            <ActivityBar
              day="Fri"
              height="55%"
              value="3"
            />

            <ActivityBar
              day="Sat"
              height="95%"
              value="6"
            />

            <ActivityBar
              day="Sun"
              height="40%"
              value="2"
            />
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          <p>
            ✨ Making service booking simple, fast
            and convenient.
          </p>
        </div>
      </div>
    </div>
  );
}

/* CARD STYLE */

const cardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "22px",
  boxShadow:
    "0 5px 18px rgba(15, 23, 42, 0.05)",
};

const headingStyle = {
  margin: 0,
  fontSize: "21px",
};

const mutedStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: "13px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
};

/* STAT CARD */

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "22px",
        boxShadow:
          "0 5px 18px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "12px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
          }}
        >
          {icon}
        </div>

        <span
          style={{
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          2026
        </span>
      </div>

      <h2
        style={{
          margin: "18px 0 4px",
          fontSize: "30px",
        }}
      >
        {value}
      </h2>

      <strong
        style={{
          fontSize: "14px",
        }}
      >
        {title}
      </strong>

      <p
        style={{
          margin: "5px 0 0",
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

/* INFO BOX */

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "13px",
      }}
    >
      <div style={{ fontSize: "17px" }}>
        {icon}
      </div>

      <div
        style={{
          marginTop: "6px",
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        {label}
      </div>

      <strong
        style={{
          display: "block",
          marginTop: "3px",
          fontSize: "14px",
          wordBreak: "break-word",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/* BOOKING ROW */

function BookingRow({
  icon,
  service,
  date,
  time,
  status,
  statusColor,
  statusBackground,
}: {
  icon: string;
  service: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
  statusBackground: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        padding: "15px",
        background: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "13px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {icon}
        </div>

        <div>
          <strong
            style={{
              display: "block",
              fontSize: "14px",
            }}
          >
            {service}
          </strong>

          <span
            style={{
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            {date} • {time}
          </span>
        </div>
      </div>

      <span
        style={{
          background: statusBackground,
          color: statusColor,
          padding: "6px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "bold",
        }}
      >
        {status}
      </span>
    </div>
  );
}

/* QUICK ACTION */

function ActionButton({
  icon,
  title,
  subtitle,
  primary = false,
}: {
  icon: string;
  title: string;
  subtitle: string;
  primary?: boolean;
}) {
  return (
    <button
      style={{
        width: "100%",
        textAlign: "left",
        border: primary
          ? "none"
          : "1px solid #e2e8f0",
        background: primary
          ? "#2563eb"
          : "#f8fafc",
        color: primary
          ? "white"
          : "#0f172a",
        padding: "14px",
        borderRadius: "11px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "13px",
      }}
    >
      <span
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "9px",
          background: primary
            ? "rgba(255,255,255,0.15)"
            : "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
        }}
      >
        {icon}
      </span>

      <span>
        <strong
          style={{
            display: "block",
            fontSize: "14px",
          }}
        >
          {title}
        </strong>

        <small
          style={{
            display: "block",
            marginTop: "3px",
            color: primary
              ? "#dbeafe"
              : "#64748b",
          }}
        >
          {subtitle}
        </small>
      </span>
    </button>
  );
}

/* NOTIFICATION */

function Notification({
  icon,
  text,
  time,
}: {
  icon: string;
  text: string;
  time: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "35px",
          height: "35px",
          borderRadius: "9px",
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          {text}
        </p>

        <small
          style={{
            display: "block",
            marginTop: "4px",
            color: "#94a3b8",
          }}
        >
          {time}
        </small>
      </div>
    </div>
  );
}

/* ACTIVITY BAR */

function ActivityBar({
  day,
  height,
  value,
}: {
  day: string;
  height: string;
  value: string;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "#64748b",
        }}
      >
        {value}
      </span>

      <div
        style={{
          width: "100%",
          maxWidth: "55px",
          height: height,
          minHeight: "25px",
          background:
            "linear-gradient(to top, #2563eb, #60a5fa)",
          borderRadius: "8px 8px 3px 3px",
        }}
      />

      <span
        style={{
          fontSize: "11px",
          color: "#64748b",
        }}
      >
        {day}
      </span>
    </div>
  );
}

export default Dashboard;