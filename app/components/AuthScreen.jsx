'use client';

import Image from 'next/image';

export default function AuthScreen({ password, setPassword, authError, authLoading, onLogin }) {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <Image
            src="/consello-logo.jpg"
            alt="Consello"
            width={140}
            height={40}
            className="logo-image"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <h1>Legal Document Analysis</h1>
        <p>Enter password to access</p>
        <form onSubmit={onLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="login-input"
            autoFocus
          />
          {authError && <p className="error-text">{authError}</p>}
          <button type="submit" className="btn btn-primary btn-large" disabled={authLoading}>
            {authLoading ? 'Authenticating...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
