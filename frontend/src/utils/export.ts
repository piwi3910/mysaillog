import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  Equipment,
  MaintenanceLog,
  SafetyCheck,
  EmergencyContact,
} from './storage';
import { Trip, Weather, CrewMember, timestampToDate } from '../types';

interface ExportOptions {
  includeTrips?: boolean;
  includeEquipment?: boolean;
  includeSafetyChecks?: boolean;
  includePhotos?: boolean;
  startDate?: number;
  endDate?: number;
}

const defaultOptions: ExportOptions = {
  includeTrips: true,
  includeEquipment: true,
  includeSafetyChecks: true,
  includePhotos: true,
};

export const exportData = async (
  trips: Trip[],
  equipment: Equipment[],
  safetyChecks: SafetyCheck[],
  maintenanceLogs: MaintenanceLog[],
  options: ExportOptions = defaultOptions
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `mysaillog-export-${timestamp}.html`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  // Filter data based on date range if provided
  const filteredTrips = options.startDate && options.endDate
    ? trips.filter(trip => 
        trip.startTime >= options.startDate! && 
        trip.endTime <= options.endDate!
      )
    : trips;

  // Generate HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MySailLog Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 {
          color: #2c3e50;
        }
        .section {
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }
        .item {
          background: #f8f9fa;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 5px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }
        .photo {
          max-width: 200px;
          margin: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f4f4f4;
        }
      </style>
    </head>
    <body>
      <h1>MySailLog Export</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
  `;

  // Add trips section
  if (options.includeTrips) {
    htmlContent += `
      <div class="section">
        <h2>Sailing Trips</h2>
        ${filteredTrips.map(trip => `
          <div class="item">
            <h3>Trip on ${timestampToDate(trip.startTime).toLocaleDateString()}</h3>
            <p>Duration: ${formatDuration(trip.endTime - trip.startTime)}</p>
            <p>Weather Conditions:</p>
            <ul>
              ${trip.weatherLog.map((weather: Weather) => `
                <li>
                  Wind: ${weather.windSpeed.toFixed(1)} knots at ${weather.windDirection}°
                  (${weather.temperature ? weather.temperature.toFixed(1) + '°C, ' : ''}
                  ${weather.pressure}mb)
                </li>
              `).join('')}
            </ul>
            ${trip.crew.length > 0 ? `
              <p>Crew:</p>
              <ul>
                ${trip.crew.map((member: CrewMember) => `
                  <li>${member.name} - ${member.role}</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Add equipment section
  if (options.includeEquipment) {
    htmlContent += `
      <div class="section">
        <h2>Equipment Inventory</h2>
        <div class="grid">
          ${equipment.map(item => `
            <div class="item">
              <h3>${item.name}</h3>
              <p>Type: ${item.type}</p>
              <p>Last Maintenance: ${timestampToDate(item.lastMaintenance).toLocaleDateString()}</p>
              <p>Next Due: ${timestampToDate(item.nextMaintenance).toLocaleDateString()}</p>
              ${item.notes ? `<p>Notes: ${item.notes}</p>` : ''}
              
              <h4>Maintenance History</h4>
              <table>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Cost</th>
                </tr>
                ${maintenanceLogs
                  .filter(log => log.equipmentId === item.id)
                  .map(log => `
                    <tr>
                      <td>${timestampToDate(log.timestamp).toLocaleDateString()}</td>
                      <td>${log.type}</td>
                      <td>${log.description}</td>
                      <td>${log.cost ? `$${log.cost.toFixed(2)}` : '-'}</td>
                    </tr>
                  `).join('')}
              </table>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Add safety checks section
  if (options.includeSafetyChecks) {
    htmlContent += `
      <div class="section">
        <h2>Safety Checks</h2>
        ${safetyChecks.map(check => `
          <div class="item">
            <h3>Check on ${timestampToDate(check.timestamp).toLocaleDateString()}</h3>
            <table>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
              ${check.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.checked ? '✅' : '❌'}</td>
                  <td>${item.notes || '-'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Close HTML
  htmlContent += `
    </body>
    </html>
  `;

  try {
    // Write the HTML file
    await FileSystem.writeAsStringAsync(filePath, htmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/html',
        dialogTitle: 'Export MySailLog Data',
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

const formatDuration = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};