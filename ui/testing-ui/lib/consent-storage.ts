import { writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface ConsentRecord {
  firstName: string;
  lastName: string;
  email: string;
  acceptedAt: string;
  ipAddress?: string;
}

const STORAGE_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(STORAGE_DIR, 'leads.csv');

/**
 * Saves consent record to CSV file for lead tracking
 * Creates the file and directory if they don't exist
 */
export async function saveConsentToStorage(record: ConsentRecord): Promise<void> {
  try {
    // Ensure directory exists
    if (!existsSync(STORAGE_DIR)) {
      await mkdir(STORAGE_DIR, { recursive: true });
      console.log('✅ Created data directory:', STORAGE_DIR);
    }

    // Check if file exists
    const fileExists = existsSync(LEADS_FILE);

    // Escape and format CSV values
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const csvRow = [
      escapeCsv(record.firstName),
      escapeCsv(record.lastName),
      escapeCsv(record.email),
      escapeCsv(record.acceptedAt),
      escapeCsv(record.ipAddress || 'N/A'),
    ].join(',') + '\n';

    if (!fileExists) {
      // Create file with header
      const header = 'First Name,Last Name,Email,Accepted At,IP Address\n';
      await writeFile(LEADS_FILE, header + csvRow, 'utf-8');
      console.log('✅ Created leads file with header');
    } else {
      // Append to existing file
      await appendFile(LEADS_FILE, csvRow, 'utf-8');
    }

    console.log('✅ Lead saved:', record.email, 'at', record.acceptedAt);
  } catch (error) {
    console.error('❌ Failed to save lead to storage:', error);
    // Don't throw - we don't want to break the consent flow if storage fails
    // The session cookie will still be set and user can proceed
  }
}

/**
 * Export leads as JSON (optional utility)
 */
export async function getLeadsAsJson(): Promise<ConsentRecord[]> {
  try {
    if (!existsSync(LEADS_FILE)) {
      return [];
    }

    const fs = require('fs');
    const content = fs.readFileSync(LEADS_FILE, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header

    return lines
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const [firstName, lastName, email, acceptedAt, ipAddress] = line
          .split(',')
          .map((v: string) => v.replace(/^"|"$/g, '').replace(/""/g, '"'));

        return {
          firstName,
          lastName,
          email,
          acceptedAt,
          ipAddress: ipAddress === 'N/A' ? undefined : ipAddress,
        };
      });
  } catch (error) {
    console.error('❌ Failed to read leads:', error);
    return [];
  }
}
