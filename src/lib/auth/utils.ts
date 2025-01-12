import {TokensData} from "@/lib/auth/types.ts";

interface TokenResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

/**
 * Convert API response to TokensData format
 * @param {Object} response - The API response containing token information
 * @param {string} response.accessToken - The access token
 * @param {string} response.accessTokenExpiresAt - The access token expiration date
 * @param {string} response.refreshToken - The refresh token
 * @param {string} response.refreshTokenExpiresAt - The refresh token expiration date
 * @returns {TokensData} The converted token data
 */
const convertTokenResponse = (response: TokenResponse): TokensData => ({
  access: response.accessToken,
  accessExpiresAt: response.accessTokenExpiresAt,
  refresh: response.refreshToken,
  refreshExpiresAt: response.refreshTokenExpiresAt
});

export { convertTokenResponse };