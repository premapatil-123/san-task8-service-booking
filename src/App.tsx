import { useState } from "react";
import Dashboard from "./Dashboard";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: string;
}

const services: Service[] = [
  {
    id: 1,
    name: "Home Cleaning",
    description: "Professional cleaning service for your home.",
    duration: "2 hours",
  },
  {
    id: 2,
    name: "Computer Repair",
    description: "Laptop and desktop troubleshooting and repair.",
    duration: "1 hour",
  },
  {
    id: 3,
    name: "Car Wash",
    description: "Complete exterior and interior car cleaning.",
    duration: "45 minutes",
  },
  {
    id: 4,
    name: "Haircut",
    description: "Professional haircut and basic styling service.",
    duration: "30 minutes",
  },
];

const timeSlots = [
  "10:00 AM",
  "12:00 PM",
  "2:00 PM",
  "4:00 PM",
];

function App() {
  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [showReview, setShowReview] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [confirmed, setConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const [showDashboard, setShowDashboard] = useState(false);

  function continueToReview() {
    if (!name.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setValidationError("Please enter your phone number.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setValidationError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (!address.trim()) {
      setValidationError("Please enter your address.");
      return;
    }

    setValidationError("");
    setBookingError("");
    setShowReview(true);
  }

  async function confirmBooking() {
    if (!selectedService) {
      return;
    }

    setIsBooking(true);
    setBookingError("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name: name,
            phone: phone,
            service: selectedService.name,
            booking_date: selectedDate,
            booking_time: convertTimeTo24Hour(selectedTime),
            address: address,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create booking"
        );
      }

      setConfirmed(true);
    } catch (error) {
      console.error(error);

      setBookingError(
        "Unable to save the booking. Please make sure the backend is running."
      );
    } finally {
      setIsBooking(false);
    }
  }

  function convertTimeTo24Hour(time: string) {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:00`;
  }

  function startNewBooking() {
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setName("");
    setPhone("");
    setAddress("");
    setShowReview(false);
    setValidationError("");
    setBookingError("");
    setConfirmed(false);
  }

  // DASHBOARD
  if (showDashboard) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            padding: "20px 30px",
            background: "#1e293b",
          }}
        >
          <button
            onClick={() => setShowDashboard(false)}
            style={{
              background: "white",
              color: "#1e293b",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ← Back to Home
          </button>
        </div>

        <Dashboard
          customerName={name.trim() || "Customer"}
        />
      </div>
    );
  }

  // CONFIRMATION
  if (confirmed && selectedService) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          fontFamily: "Arial, sans-serif",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "650px",
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "55px",
              marginBottom: "15px",
            }}
          >
            ✅
          </div>

          <h1
            style={{
              fontSize: "36px",
              marginBottom: "12px",
            }}
          >
            Booking Confirmed!
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "17px",
              lineHeight: 1.6,
            }}
          >
            Your booking has been successfully saved.
          </p>

          <div
            style={{
              textAlign: "left",
              marginTop: "30px",
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "22px",
            }}
          >
            <p>
              <strong>Service:</strong>{" "}
              {selectedService.name}
            </p>

            <p>
              <strong>Date:</strong> {selectedDate}
            </p>

            <p>
              <strong>Time:</strong> {selectedTime}
            </p>

            <p>
              <strong>Name:</strong> {name}
            </p>

            <p>
              <strong>Phone:</strong> {phone}
            </p>

            <p>
              <strong>Address:</strong> {address}
            </p>

            <p>
              <strong>Status:</strong> Pending
            </p>
          </div>

          <button
            onClick={() => setShowDashboard(true)}
            style={{
              marginTop: "25px",
              marginRight: "10px",
              background: "#1e293b",
              color: "white",
              border: "none",
              padding: "13px 22px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            📊 View Dashboard
          </button>

          <button
            onClick={startNewBooking}
            style={{
              marginTop: "25px",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "13px 22px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            Book Another Service
          </button>
        </section>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#1e293b",
          color: "white",
          padding: "25px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              color: "#ffffff",
            }}
          >
            QuickBook Service Booking
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#cbd5e1",
              fontSize: "15px",
            }}
          >
            Book • Manage • Enjoy
          </p>
        </div>

        <button
          onClick={() => setShowDashboard(true)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          📊 Dashboard
        </button>
      </header>

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* STEP 1 */}
        <h2>1. Choose a Service</h2>

        <p style={{ color: "#64748b" }}>
          Select the service you want to book.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "22px",
            marginTop: "25px",
          }}
        >
          {services.map((service) => (
            <div
              key={service.id}
              style={{
                background: "white",
                border:
                  selectedService?.id === service.id
                    ? "2px solid #2563eb"
                    : "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h3>{service.name}</h3>

              <p
                style={{
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                {service.description}
              </p>

              <p style={{ color: "#64748b" }}>
                Duration: {service.duration}
              </p>

              <button
                onClick={() => {
                  setSelectedService(service);
                  setSelectedDate("");
                  setSelectedTime("");
                  setName("");
                  setPhone("");
                  setAddress("");
                  setShowReview(false);
                  setValidationError("");
                  setBookingError("");
                  setConfirmed(false);
                }}
                style={{
                  width: "100%",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Select Service
              </button>
            </div>
          ))}
        </div>

        {/* STEP 2 */}
        {selectedService && (
          <section
            style={{
              marginTop: "40px",
              background: "white",
              borderRadius: "14px",
              padding: "25px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h2>2. Choose Date & Time</h2>

            <p style={{ color: "#64748b" }}>
              Booking:{" "}
              <strong>{selectedService.name}</strong>
            </p>

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginTop: "20px",
                marginBottom: "8px",
              }}
            >
              Select Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setShowReview(false);
              }}
              min={new Date().toISOString().split("T")[0]}
              style={{
                width: "100%",
                maxWidth: "300px",
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />

            <h3 style={{ marginTop: "25px" }}>
              Available Time Slots
            </h3>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setSelectedTime(time);
                    setShowReview(false);
                  }}
                  style={{
                    background:
                      selectedTime === time
                        ? "#2563eb"
                        : "#f1f5f9",
                    color:
                      selectedTime === time
                        ? "white"
                        : "#0f172a",
                    border: "1px solid #cbd5e1",
                    padding: "11px 18px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* STEP 3 */}
        {selectedService && selectedDate && selectedTime && (
          <section
            style={{
              marginTop: "40px",
              background: "white",
              borderRadius: "14px",
              padding: "25px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h2>3. Enter Your Details</h2>

            <p style={{ color: "#64748b" }}>
              Enter your information for the booking.
            </p>

            <div
              style={{
                display: "grid",
                gap: "20px",
                maxWidth: "650px",
                marginTop: "25px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setValidationError("");
                    setShowReview(false);
                  }}
                  placeholder="Enter your full name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setValidationError("");
                    setShowReview(false);
                  }}
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Address
                </label>

                <textarea
                  value={address}
                  onChange={(event) => {
                    setAddress(event.target.value);
                    setValidationError("");
                    setShowReview(false);
                  }}
                  placeholder="Enter your address"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            {validationError && (
              <div
                style={{
                  marginTop: "20px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                {validationError}
              </div>
            )}

            <button
              onClick={continueToReview}
              style={{
                marginTop: "25px",
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "13px 22px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              Continue to Review
            </button>
          </section>
        )}

        {/* STEP 4 */}
        {showReview && selectedService && (
          <section
            style={{
              marginTop: "40px",
              background: "white",
              borderRadius: "14px",
              padding: "30px",
              border: "1px solid #e2e8f0",
              boxShadow:
                "0 5px 18px rgba(15, 23, 42, 0.06)",
            }}
          >
            <h2>4. Review Your Booking</h2>

            <p style={{ color: "#64748b" }}>
              Please check all the information before
              confirming your booking.
            </p>

            <div
              style={{
                marginTop: "25px",
                display: "grid",
                gap: "12px",
                maxWidth: "700px",
              }}
            >
              <div>
                <strong>Service:</strong>{" "}
                {selectedService.name}
              </div>

              <div>
                <strong>Duration:</strong>{" "}
                {selectedService.duration}
              </div>

              <div>
                <strong>Date:</strong> {selectedDate}
              </div>

              <div>
                <strong>Time:</strong> {selectedTime}
              </div>

              <div>
                <strong>Name:</strong> {name}
              </div>

              <div>
                <strong>Phone:</strong> {phone}
              </div>

              <div>
                <strong>Address:</strong> {address}
              </div>
            </div>

            {bookingError && (
              <div
                style={{
                  marginTop: "20px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                {bookingError}
              </div>
            )}

            <button
              onClick={confirmBooking}
              disabled={isBooking}
              style={{
                marginTop: "25px",
                background: isBooking
                  ? "#94a3b8"
                  : "#16a34a",
                color: "white",
                border: "none",
                padding: "13px 22px",
                borderRadius: "8px",
                cursor: isBooking
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              {isBooking
                ? "Saving Booking..."
                : "Confirm Booking"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;