import { useState, useCallback } from 'react';
import { parseSheetDate, toNum, toNumOrNull, sanitizeString } from '../utils/helpers';

export const useSheetData = () => {
  const [rawRecords, setRawRecords] = useState([]);
  const [rawFriends, setRawFriends] = useState([]);
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

      // Parse Records sheet
      const records = (json.Records || []).map(row => {
        let month = row['Month'] || '';
        let day = Number(row['Date']) || 0;
        let year = 2025; // default fallback
        if (month && month.toString().startsWith('Date(')) {
          const parsed = parseSheetDate(month);
          month = parsed.month;
          day = parsed.day;
          year = parsed.year;
        }
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

      // Parse Friends sheet
      const friends = (json.Friends || []).map(row => ({
        Name: sanitizeString(row['Name'] || ''),
        Description: sanitizeString(row['Discription'] || row['Description'] || ''),
        Amount: toNum(row['Amount']),
        Status: sanitizeString(row['Status'] || ''),
      })).filter(r => r.Name);

      setRawRecords(records);
      setRawFriends(friends);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { rawRecords, rawFriends, loading, error, lastUpdated, fetchData };
};
