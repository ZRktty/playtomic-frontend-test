import { describe, it, expect } from 'vitest'
import { convertTokenResponse } from './utils'

describe('convertTokenResponse', () => {
  it('should convert token response to TokensData format', () => {
    const input = {
      accessToken: 'abc123',
      accessTokenExpiresAt: '2024-03-15T00:00:00Z',
      refreshToken: 'xyz789',
      refreshTokenExpiresAt: '2024-03-16T00:00:00Z'
    }

    const result = convertTokenResponse(input)

    expect(result).toEqual({
      access: 'abc123',
      accessExpiresAt: '2024-03-15T00:00:00Z',
      refresh: 'xyz789',
      refreshExpiresAt: '2024-03-16T00:00:00Z'
    })
  })

  it('should handle empty tokens', () => {
    const input = {
      accessToken: '',
      accessTokenExpiresAt: '2024-03-15T00:00:00Z',
      refreshToken: '',
      refreshTokenExpiresAt: '2024-03-16T00:00:00Z'
    }

    const result = convertTokenResponse(input)

    expect(result.access).toBe('')
    expect(result.refresh).toBe('')
  })
});