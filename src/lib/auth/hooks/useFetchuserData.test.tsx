import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFetchUserData } from './useFetchUserData';
import { renderHook } from '@testing-library/react';

const mockFetcher = vi.fn();
vi.mock('@/lib/api', () => ({
  useApiFetcher: () => mockFetcher
}));

describe('useFetchUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user data successfully', async () => {
    const mockUser = {
      userId: '123',
      displayName: 'Test User',
      email: 'test@example.com'
    };

    mockFetcher.mockResolvedValueOnce({
      ok: true,
      data: mockUser
    });

    const { result } = renderHook(() => useFetchUserData());
    const userData = await result.current('test-token');

    expect(mockFetcher).toHaveBeenCalledWith('GET /v1/users/me', {}, {
      headers: { Authorization: 'Bearer test-token' }
    });
    expect(userData).toEqual({
      userId: '123',
      name: 'Test User',
      email: 'test@example.com'
    });
  });

  it('should handle error response', async () => {
    mockFetcher.mockResolvedValueOnce({
      ok: false,
      data: { message: 'Unauthorized' }
    });

    const { result } = renderHook(() => useFetchUserData());
    await expect(result.current('test-token')).rejects.toThrow('Unauthorized');
  });

  it('should handle missing email', async () => {
    const mockUser = {
      userId: '123',
      displayName: 'Test User',
      email: null
    };

    mockFetcher.mockResolvedValueOnce({
      ok: true,
      data: mockUser
    });

    const { result } = renderHook(() => useFetchUserData());
    const userData = await result.current('test-token');

    expect(userData.email).toBe('');
  });
});