import { Match } from '@/lib/api-types'
import { ApiFetcher } from "@/lib/api/fetcher.ts";


/**
 * Downloads all matches as a CSV file.
 *
 * The current API allows only paginated requests, so in order to download all matches,
 * we have to make multiple requests and concatenate the results.
 *
 * @param {ApiFetcher} fetcher - The API fetcher to use for fetching matches.
 * @returns {Promise<void>} A promise that resolves when the CSV file has been downloaded.
 */
export async function downloadMatchesAsCsv(fetcher: ApiFetcher): Promise<void> {
    const PAGE_SIZE = 10
    let page = 0
    let allMatches: Match[] = []
    let hasMore = true

    // Fetch matches from the API with pagination
    while (hasMore) {
        const response = await fetcher('GET /v1/matches', { page, size: PAGE_SIZE })
        const matches = response.data as Match[];
        allMatches = [...allMatches, ...matches]

        const total = parseInt(response.headers.get('total') ?? '0')
        hasMore = allMatches.length < total
        page++
    }

    // Convert to CSV
    const headers = ['Match ID', 'Sport', 'Date', 'Start Time', 'End Time', 'Venue ID', 'Court ID', 'Players']
    const rows = allMatches.map(match => [
        match.matchId,
        match.sport,
        match.startDate.substring(0, 10),
        match.startDate.substring(11, 16),
        match.endDate.substring(11, 16),
        match.venueId,
        match.courtId,
        match.teams.flatMap(team =>
            team.players.map(p => p.displayName)
        ).join(', ')
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')

    downloadCsvFile(csv)
}

function downloadCsvFile(csv: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `matches-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}