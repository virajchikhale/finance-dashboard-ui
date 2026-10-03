import { render, screen, act } from '@testing-library/react';
import App from './App';
import { isValidScriptUrl } from './utils/helpers';
import { useSheetData } from './hooks/useSheetData';
import { renderHook } from '@testing-library/react';

beforeEach(() => localStorage.clear());

test('first visit shows the setup screen', () => {
  render(<App />);
  expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument();
});

describe('isValidScriptUrl', () => {
  test.each([
    'https://script.google.com/macros/s/AKfy/exec',
    'https://script.google.com/macros/s/AKfy/exec?key=abc',
    'https://script.googleusercontent.com/macros/echo?user_content_key=x',
  ])('accepts %s', (u) => expect(isValidScriptUrl(u)).toBe(true));

  test.each([
    '', 'not a url', 'http://script.google.com/macros/s/x/exec',
    'https://evilscript.google.com/macros/s/x/exec',        // look-alike host
    'https://script.google.com.evil.example/macros/s/x/exec',
    'https://evil.googleusercontent.com/x',
    'javascript:alert(1)',
  ])('rejects %s', (u) => expect(isValidScriptUrl(u)).toBe(false));
});

describe('useSheetData', () => {
  const okResponse = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

  test('surfaces an Unauthorized answer from the script as an error instead of an empty dashboard', async () => {
    global.fetch = jest.fn(() => okResponse({ error: 'Unauthorized' }));
    const { result } = renderHook(() => useSheetData());
    await act(async () => { await result.current.fetchData('https://script.google.com/macros/s/x/exec?key=wrong'); });
    expect(result.current.error).toBe('Unauthorized');
    expect(result.current.rawRecords).toEqual([]);
  });

  test('parses records and instalments', async () => {
    global.fetch = jest.fn(() => okResponse({
      Records: [{ Date: '2026-06-09T00:00:00.000Z', Description: 'Lunch', Amount: '120', 'Transaction Type': 'Debit', Category: 'Food' }],
      Instalments: [{ Category: 'Rent', Annually: 12000, Monthly: 1000, Daily: 33 }],
    }));
    const { result } = renderHook(() => useSheetData());
    await act(async () => { await result.current.fetchData('https://script.google.com/macros/s/x/exec?key=k'); });
    expect(result.current.error).toBeNull();
    expect(result.current.rawRecords).toHaveLength(1);
    expect(result.current.rawRecords[0].Amount).toBe(120);
    expect(result.current.rawInstalments[0].category).toBe('Rent');
  });
});
