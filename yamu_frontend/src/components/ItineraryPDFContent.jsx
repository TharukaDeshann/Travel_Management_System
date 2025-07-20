import React from "react";

const yamuLogoUrl = "/logo512.png"; // Use your logo path in public/

// Updated styles for better elegance and readability
const tableHeaderStyle = {
  background: "#1e40af",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: 0.5,
  border: "none",
  padding: "12px 8px",
  textAlign: "left"
};

const cellStyle = {
  padding: "10px 8px",
  fontSize: 13,
  borderBottom: "1px solid #e5e7eb"
};

const summaryLabelStyle = {
  color: "#1e40af",
  fontWeight: 500,
  fontSize: 13,
  marginRight: 6,
  minWidth: 120,
  display: "inline-block"
};

const summaryValueStyle = {
  color: "#111827",
  fontWeight: 600,
  fontSize: 13
};

const icon = (emoji, label) => (
  <span style={{ fontSize: 14, marginRight: 4 }} role="img" aria-label={label}>{emoji}</span>
);

const ItineraryPDFContent = ({
  itinerary,
  uniqueDayPlans,
  getHotelBookingForDayPlan,
  getDriverBookingForDayPlan,
  getGuideReservationForDayPlan,
  getOrderedLocations,
  totalAccommodation,
  totalTransport,
  totalGuide,
  totalSpent,
  remainingBudget,
}) => (
  <div style={{
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    fontSize: "13px",
    color: "#374151",
    padding: 0,
    margin: 0,
    background: "#f9fafb",
    width: 950,
    minHeight: 670,
    overflow: "hidden"
  }}>
    {/* Header */}
    <div style={{
      background: "#1e40af",
      color: "#fff",
      padding: "28px 40px",
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #e5e7eb"
    }}>
      <img src={yamuLogoUrl} alt="Yamu Logo" style={{ 
        height: 48, 
        width: 48, 
        borderRadius: 8, 
        marginRight: 20, 
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: 24, 
          fontWeight: 700, 
          letterSpacing: 0.5,
          marginBottom: 4
        }}>
          {itinerary?.tripTitle || "Trip Itinerary"}
        </div>
        <div style={{ 
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 6,
          fontSize: 13,
          color: "#e0e7ff"
        }}>
          <div>
            {icon("📅", "Dates")}
            <span>
              {new Date(itinerary?.startDate).toLocaleDateString()} - {new Date(itinerary?.endDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            {icon("💰", "Budget")}
            <span>
              {itinerary?.currency} {itinerary?.budget?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div style={{ padding: "24px 40px" }}>
      {/* Itinerary Table */}
      <div style={{
        marginBottom: 32,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff"
        }}>
          <thead>
            <tr>
              <th style={{ ...tableHeaderStyle, width: "5%" }}>{icon("🔢", "Day")}Day</th>
              <th style={{ ...tableHeaderStyle, width: "12%" }}>{icon("📅", "Date")}Date</th>
              <th style={{ ...tableHeaderStyle, width: "25%" }}>{icon("📍", "Locations")}Locations</th>
              <th style={{ ...tableHeaderStyle, width: "20%" }}>{icon("🏨", "Hotel")}Hotel</th>
              <th style={{ ...tableHeaderStyle, width: "15%" }}>{icon("🚗", "Transport")}Transport</th>
              <th style={{ ...tableHeaderStyle, width: "13%" }}>{icon("🧑‍💼", "Guide")}Guide</th>
              <th style={{ ...tableHeaderStyle, width: "10%", textAlign: "right" }}>{icon("💵", "Costs")}Costs</th>
            </tr>
          </thead>
          <tbody>
            {uniqueDayPlans.map((dayPlan, idx) => {
              const hotelBooking = getHotelBookingForDayPlan(dayPlan.id);
              const driverBooking = getDriverBookingForDayPlan(dayPlan.id);
              const guideReservation = getGuideReservationForDayPlan(dayPlan.id);
              const locations = getOrderedLocations(dayPlan.locations);
              
              return (
                <tr key={dayPlan.id} style={{ 
                  borderBottom: "1px solid #e5e7eb",
                  background: idx % 2 === 0 ? "#f9fafb" : "#fff"
                }}>
                  <td style={{ ...cellStyle, fontWeight: 500, textAlign: "center" }}>{idx + 1}</td>
                  <td style={cellStyle}>{new Date(dayPlan.date).toLocaleDateString()}</td>
                  <td style={cellStyle}>
                    <div style={{ lineHeight: 1.4 }}>
                      {locations.map((loc, i) => (
                        <div key={i}>
                          {i > 0 && <span style={{ color: "#9ca3af", margin: "0 4px" }}>•</span>}
                          {loc.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={cellStyle}>
                    {hotelBooking ? (
                      <>
                        <div style={{ fontWeight: 500 }}>{hotelBooking.hotel?.name || ""}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{hotelBooking.roomType || ""}</div>
                      </>
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td style={cellStyle}>
                    {driverBooking ? (
                      <>
                        <div style={{ fontWeight: 500 }}>{driverBooking.driver?.name || ""}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{driverBooking.driver?.vehicleType || ""}</div>
                      </>
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td style={cellStyle}>
                    {guideReservation ? (
                      <div style={{ fontWeight: 500 }}>{guideReservation.guideName}</div>
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    {[
                      hotelBooking?.totalPrice && `${itinerary?.currency} ${Number(hotelBooking.totalPrice).toLocaleString()}`,
                      driverBooking?.travelCost && `${itinerary?.currency} ${Number(driverBooking.travelCost).toLocaleString()}`,
                      guideReservation?.estimatedPrice && `${itinerary?.currency} ${Number(guideReservation.estimatedPrice).toLocaleString()}`
                    ].filter(Boolean).join(" / ") || <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div style={{
        background: "#fff",
        borderRadius: 8,
        padding: 20,
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb"
      }}>
        <h3 style={{ 
          margin: "0 0 16px 0",
          color: "#1e40af",
          fontSize: 15,
          fontWeight: 600
        }}>
          {icon("💰", "Summary")} Financial Summary
        </h3>
        
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px 24px"
        }}>
          <div>
            <span style={summaryLabelStyle}>Total Accommodation:</span>
            <span style={summaryValueStyle}>{itinerary?.currency} {totalAccommodation.toLocaleString()}</span>
          </div>
          <div>
            <span style={summaryLabelStyle}>Total Transport:</span>
            <span style={summaryValueStyle}>{itinerary?.currency} {totalTransport.toLocaleString()}</span>
          </div>
          <div>
            <span style={summaryLabelStyle}>Total Guide:</span>
            <span style={summaryValueStyle}>{itinerary?.currency} {totalGuide.toLocaleString()}</span>
          </div>
          <div>
            <span style={summaryLabelStyle}>Total Spent:</span>
            <span style={summaryValueStyle}>{itinerary?.currency} {totalSpent.toLocaleString()}</span>
          </div>
          <div>
            <span style={summaryLabelStyle}>Initial Budget:</span>
            <span style={summaryValueStyle}>{itinerary?.currency} {itinerary?.budget?.toLocaleString()}</span>
          </div>
          <div>
            <span style={summaryLabelStyle}>Remaining:</span>
            <span style={{ 
              ...summaryValueStyle, 
              color: remainingBudget >= 0 ? '#065f46' : '#b91c1c'
            }}>
              {itinerary?.currency} {remainingBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: "center",
        padding: "16px 0",
        color: "#4b5563",
        fontSize: 13,
        borderTop: "1px solid #e5e7eb",
        marginTop: 16
      }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>
          Thank you for choosing <span style={{ fontWeight: 600, color: "#1e40af" }}>Yamu</span>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          Safe travels and enjoy your journey! {icon("✈️", "Plane")}{icon("🌍", "Globe")}
        </div>
      </div>
    </div>
  </div>
);

export default ItineraryPDFContent;