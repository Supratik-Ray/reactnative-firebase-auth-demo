import axios from "axios";

const API_KEY = "";

async function authenticate(mode, email, password) {
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`,
    { email, password, returnSecureToken: true }
  );

  return {
    token: response.data.idToken,
    refreshToken: response.data.refreshToken,
    expiresIn: response.data.expiresIn,
  };
}

export function createUser(email, password) {
  return authenticate("signUp", email, password);
}

export function login(email, password) {
  return authenticate("signInWithPassword", email, password);
}

export async function renewToken(refreshToken) {
  const url = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;
  const response = await axios.post(url, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  return {
    token: response.data.id_token,
    refreshToken: response.data.refresh_token,
    expiresIn: response.data.expires_in,
  };
}
