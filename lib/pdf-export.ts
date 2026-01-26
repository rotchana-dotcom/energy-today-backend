import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { DailyEnergy, UserProfile } from "@/types";
import { PatternAnalysis } from "./pattern-insights";

/**
 * Generate and share a PDF report of the calendar view
 */
export async function exportCalendarPDF(
  profile: UserProfile,
  monthEnergy: DailyEnergy[],
  month: Date
): Promise<void> {
  if (Platform.OS === "web") {
    alert("PDF export is not available on web. Please use the mobile app.");
    return;
  }

  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #11181C;
        }
        h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #0A7EA4;
        }
        h2 {
          font-size: 20px;
          font-weight: 600;
          margin-top: 30px;
          margin-bottom: 15px;
        }
        .subtitle {
          font-size: 14px;
          color: #687076;
          margin-bottom: 30px;
        }
        .profile {
          background: #F5F5F5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .profile-item {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .profile-label {
          font-weight: 600;
          color: #687076;
        }
        .calendar {
          margin-top: 20px;
        }
        .day-entry {
          padding: 12px;
          margin-bottom: 10px;
          border-left: 4px solid;
          background: #F5F5F5;
          border-radius: 4px;
        }
        .day-entry.strong {
          border-left-color: #22C55E;
        }
        .day-entry.moderate {
          border-left-color: #F59E0B;
        }
        .day-entry.challenging {
          border-left-color: #EF4444;
        }
        .day-date {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .day-details {
          font-size: 12px;
          color: #687076;
          line-height: 1.5;
        }
        .legend {
          display: flex;
          gap: 20px;
          margin-top: 20px;
          font-size: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 12px;
          color: #687076;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Energy Calendar Report</h1>
      <div class="subtitle">${monthName}</div>
      
      <div class="profile">
        <div class="profile-item">
          <span class="profile-label">Name:</span> ${profile.name}
        </div>
        <div class="profile-item">
          <span class="profile-label">Date of Birth:</span> ${new Date(profile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
        <div class="profile-item">
          <span class="profile-label">Place of Birth:</span> ${profile.placeOfBirth.city}, ${profile.placeOfBirth.country}
        </div>
      </div>

      <h2>Daily Energy Overview</h2>
      <div class="calendar">
        ${monthEnergy.map((day) => `
          <div class="day-entry ${day.connection.alignment}">
            <div class="day-date">
              ${new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              ${day.lunarPhaseEmoji}
            </div>
            <div class="day-details">
              <strong>Your Energy:</strong> ${day.userEnergy.type} (${day.userEnergy.intensity}%)<br>
              <strong>Today's Energy:</strong> ${day.environmentalEnergy.type} (${day.environmentalEnergy.intensity}%)<br>
              <strong>Alignment:</strong> ${day.connection.alignment.charAt(0).toUpperCase() + day.connection.alignment.slice(1)}<br>
              <strong>Lunar Phase:</strong> ${day.lunarPhase.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          </div>
        `).join("")}
      </div>

      <div class="legend">
        <div class="legend-item">
          <div class="legend-dot" style="background: #22C55E;"></div>
          <span>Strong Alignment</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: #F59E0B;"></div>
          <span>Moderate Alignment</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: #EF4444;"></div>
          <span>Challenging Alignment</span>
        </div>
      </div>

      <div class="footer">
        Generated by Energy Today • ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Energy Calendar - ${monthName}`,
        UTI: "com.adobe.pdf",
      });
    } else {
      alert("PDF saved! Check your downloads folder.");
    }
  } catch (error) {
    console.error("Error exporting PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
}

/**
 * Generate and share a PDF report of pattern insights
 */
export async function exportInsightsPDF(
  profile: UserProfile,
  analysis: PatternAnalysis
): Promise<void> {
  if (Platform.OS === "web") {
    alert("PDF export is not available on web. Please use the mobile app.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #11181C;
        }
        h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #0A7EA4;
        }
        .subtitle {
          font-size: 14px;
          color: #687076;
          margin-bottom: 30px;
        }
        .profile {
          background: #F5F5F5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .profile-item {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .profile-label {
          font-weight: 600;
          color: #687076;
        }
        .insight {
          background: #F5F5F5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #0A7EA4;
        }
        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }
        .insight-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .insight-meta {
          font-size: 12px;
          color: #687076;
        }
        .insight-category {
          display: inline-block;
          background: #0A7EA4;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-right: 8px;
        }
        .insight-description {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .insight-actionable {
          background: #E6F4FE;
          padding: 12px;
          border-radius: 4px;
          border-left: 3px solid #22C55E;
        }
        .actionable-label {
          font-size: 11px;
          font-weight: 600;
          color: #22C55E;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .actionable-text {
          font-size: 13px;
          line-height: 1.5;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 12px;
          color: #687076;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Pattern Insights Report</h1>
      <div class="subtitle">Based on ${analysis.totalEntries} journal entries</div>
      
      <div class="profile">
        <div class="profile-item">
          <span class="profile-label">Name:</span> ${profile.name}
        </div>
        <div class="profile-item">
          <span class="profile-label">Analysis Date:</span> ${new Date(analysis.analysisDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      ${analysis.insights.map((insight) => `
        <div class="insight">
          <div class="insight-header">
            <div>
              <div class="insight-title">${insight.title}</div>
              <div class="insight-meta">
                <span class="insight-category">${insight.category}</span>
                ${insight.confidence}% confidence
              </div>
            </div>
          </div>
          <div class="insight-description">
            ${insight.description}
          </div>
          <div class="insight-actionable">
            <div class="actionable-label">Actionable Insight</div>
            <div class="actionable-text">${insight.actionable}</div>
          </div>
        </div>
      `).join("")}

      <div class="footer">
        Generated by Energy Today • ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}<br>
        <em>Pro Feature</em>
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Pattern Insights Report",
        UTI: "com.adobe.pdf",
      });
    } else {
      alert("PDF saved! Check your downloads folder.");
    }
  } catch (error) {
    console.error("Error exporting PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
}
