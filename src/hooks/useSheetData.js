import { useState, useCallback } from 'react';
import { parseSheetDate, toNum, toNumOrNull, sanitizeString } from '../utils/helpers';

export const useSheetData = () => {
  const [rawRecords, setRawRecords] = useState([]);
  const [rawInstalments, setRawInstalments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (url) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && json.error) throw new Error(json.error);   // e.g. "Unauthorized" when the access key is missing or wrong

      // Parse Records sheet — includes Credit, Debit, Transferd, Owes, Owed, Setteled
      // New sheet: "Date" column holds an ISO date string (e.g. "2026-06-09T00:00:00.000Z")
      // There is NO separate "Month" column — we derive month/day/year from the Date field.
      const records = (json.Records || []).map(row => {
        const rawDate = row['Date'] || ''; // ISO string from Apps Script
        const parsed = parseSheetDate(rawDate);
        const month = parsed.month;
        const day   = parsed.day;
        const year  = parsed.year;
        return {
          Year: year,
          Month: month,
          Date: day,
          Description: sanitizeString(row['Description'] || ''),
          Name: sanitizeString(row['Name'] || ''),
          Amount: toNum(row['Amount']),
          'Transaction Type': sanitizeString(row['Transaction Type'] || ''),
          Category: sanitizeString(row['Category'] || ''),
          'Account Name': sanitizeString(row['Account Name'] || ''),
          'To Account': sanitizeString(row['To Account'] || ''),
          'Account Balance': toNumOrNull(row['Account Balance']),
          'To Account Balance': toNumOrNull(row['To Account Balance']),
        };
      }).filter(r => r.Month);

      // Parse Instalments sheet — fixed recurring costs
      const instalments = (json.Instalments || []).map(row => ({
        category: sanitizeString(row['Category'] || ''),
        annually: toNum(row['Annually']),
        monthly: toNum(row['Monthly']),
        daily: toNum(row['Daily']),
      })).filter(r => r.category && r.annually > 0);

      setRawRecords(records);
      setRawInstalments(instalments);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { rawRecords, rawInstalments, loading, error, lastUpdated, fetchData };
};
