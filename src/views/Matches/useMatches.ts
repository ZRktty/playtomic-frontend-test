import { useState } from 'react'
import useSWR from 'swr'
import { useApiFetcher } from '@/lib/api'
import { Match } from '@/lib/api-types'

interface UseMatchesResult {
  matches: Match[]
  total: number
  page: number
  size: number
  setPage: (page: number) => void
  setSize: (size: number) => void
}

export function useMatches(): UseMatchesResult {
  const [page, setPage] = useState<number>(0)
  const [size, setSize] = useState<number>(10)
  const fetcher = useApiFetcher()
  const query = useSWR(
    { page, size },
    async ({ page, size }: { page: number, size: number}): Promise<{ matches: Match[], total: number }> => {
      const res = await fetcher('GET /v1/matches', { page, size })

      if (!res.ok) {
        throw new Error(res.data.message)
      }

      const totalCount = res.headers.get('total')
      const total = totalCount ? Number.parseInt(totalCount) : res.data.length
      return { matches: res.data, total }
    },
    { keepPreviousData: true, suspense: true },
  )

  return {
    matches: query.data.matches,
    total: query.data.total,
    page,
    size,
    setPage,
    setSize,
  }
}