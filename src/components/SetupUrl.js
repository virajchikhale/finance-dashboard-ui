import React, { useState } from 'react';
import { isValidScriptUrl } from '../utils/helpers';
import Icon from './Icon';

const SetupUrl = ({ onSave }) => {
  const [url, setUrl] = useState('');
  const trimmed = url.trim();
  const valid = isValidScriptUrl(trimmed);
  const showError = trimmed !== '' && !valid;

  const submit = (e) => {
    e.preventDefault();
    if (valid) onSave(trimmed);
  };

  return (
    <main className="center-screen">
      <div className="card setup">
        <div className="brand" style={{ marginBottom: 18 }}>
          <span className="brand-mark"><Icon name="mark" /></span>Finances
        </div>
        <h1 style={{ fontSize: 20, marginBottom: 6 }}>Welcome to your dashboard</h1>
        <p className="muted" style={{ margin: '0 0 20px' }}>
          Connect the Apps Script web app that serves your sheet. The URL and its key are kept only in this browser and sent only to Google.
        </p>

        <form onSubmit={submit} className="stack">
          <label className="field">
            <span className="field-label">Web app URL</span>
            <input className={`input${showError ? ' invalid' : ''}`} type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/…/exec?key=…" autoComplete="off" required
              aria-invalid={showError} aria-describedby="url-hint" />
            <span id="url-hint" className={showError ? 'small neg' : 'hint'}>
              {showError ? 'This must be an https://script.google.com address.' : 'Apps Script → Deploy → Web app URL, followed by ?key=<READ_KEY>.'}
            </span>
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={!valid}>Connect</button>
        </form>
      </div>
    </main>
  );
};

export default SetupUrl;
