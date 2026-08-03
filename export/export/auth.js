/**
 * Email OTP auth for report-builder — reuses Stance GraphQL sendEmailOTP / verifyEmailOTP.
 * Existing Stance users only (sendEmailOTP rejects unknown emails).
 */
(function (global) {
  const STORAGE = {
    token: 'stance_rb_token',
    refreshToken: 'stance_rb_refreshToken',
    user: 'stance_rb_user',
  };

  // Override at runtime: window.STANCE_GRAPHQL_URL = 'http://localhost:3000/graphql'
  const GRAPHQL_URL =
    (typeof global.STANCE_GRAPHQL_URL === 'string' && global.STANCE_GRAPHQL_URL) ||
    'https://devapi.stance.health/graphql';

  function getToken() {
    try {
      return localStorage.getItem(STORAGE.token);
    } catch {
      return null;
    }
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(STORAGE.user);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function isAccessTokenValid(token) {
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return false;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      // 30s clock skew buffer
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now() + 30000;
    } catch {
      return false;
    }
  }

  function isLoggedIn() {
    return isAccessTokenValid(getToken());
  }

  function clearAuth() {
    try {
      localStorage.removeItem(STORAGE.token);
      localStorage.removeItem(STORAGE.refreshToken);
      localStorage.removeItem(STORAGE.user);
    } catch {
      /* ignore */
    }
  }

  function saveSession(session) {
    localStorage.setItem(STORAGE.token, session.token);
    if (session.refreshToken) {
      localStorage.setItem(STORAGE.refreshToken, session.refreshToken);
    }
    if (session.user) {
      localStorage.setItem(STORAGE.user, JSON.stringify(session.user));
    }
  }

  function authHeaders(extra) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, extra || {});
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
  }

  async function graphql(query, variables) {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors && json.errors.length) {
      const msg = json.errors[0].message || 'Request failed';
      const err = new Error(msg);
      err.graphqlErrors = json.errors;
      throw err;
    }
    return json.data;
  }

  async function sendEmailOTP(email) {
    const data = await graphql(
      `mutation SendEmailOTP($email: String!) {
        sendEmailOTP(email: $email) { token expiresAt expiresIn }
      }`,
      { email: email.trim().toLowerCase() }
    );
    return data.sendEmailOTP;
  }

  async function verifyEmailOTP(email, otp, otpToken) {
    const data = await graphql(
      `mutation VerifyEmailOTP($input: VerifyEmailOTPInput!) {
        verifyEmailOTP(input: $input) {
          token
          refreshToken
          user { _id email userType seqNo }
        }
      }`,
      {
        input: {
          email: email.trim().toLowerCase(),
          otp: String(otp).trim(),
          token: otpToken,
        },
      }
    );
    const session = data.verifyEmailOTP;
    saveSession(session);
    return session;
  }

  function logout() {
    clearAuth();
  }

  global.StanceAuth = {
    GRAPHQL_URL,
    getToken,
    getUser,
    isLoggedIn,
    isAccessTokenValid,
    clearAuth,
    saveSession,
    authHeaders,
    sendEmailOTP,
    verifyEmailOTP,
    logout,
  };
})(typeof window !== 'undefined' ? window : globalThis);
