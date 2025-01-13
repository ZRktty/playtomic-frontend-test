import { describe, it, expect, vi, beforeEach } from 'vitest'
import { downloadCsvFile, downloadMatchesAsCsv } from './matchesExport'
import type { Match } from '@/lib/api-types'

/* eslint-disable @typescript-eslint/unbound-method */
describe('downloadMatchesAsCsv', () => {
    const mockMatch: Match = {
        matchId: '123',
        sport: 'TENNIS',
        startDate: '2023-01-01T10:00:00',
        endDate: '2023-01-01T11:00:00',
        venueId: 'venue1',
        courtId: 'court1',
        teams: [
            {
                id: '1',
                players: [
                    { displayName: 'Player 1', userId: '1', email: 'player1@test.com', pictureURL: 'http://test.com/1.jpg' },
                    { displayName: 'Player 2', userId: '2', email: 'player2@test.com', pictureURL: 'http://test.com/2.jpg' }
                ]
            }
        ]
    }

    beforeEach(() => {
        // Create a mock Blob implementation
        const mockBlob = vi.fn()
        global.Blob = vi.fn().mockImplementation((...args) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            mockBlob(...args)
            return { /* mock blob properties if needed */ }
        })

        // Mock URL methods
        global.URL.createObjectURL = vi.fn(() => 'mock-url')
        global.URL.revokeObjectURL = vi.fn()

        // Mock document methods
        document.createElement = vi.fn().mockReturnValue({
            setAttribute: vi.fn(),
            click: vi.fn(),
            style: {},
            download: '',
            href: ''
        })
        document.body.appendChild = vi.fn()
        document.body.removeChild = vi.fn()
    })

    it('should fetch all matches and generate CSV', async () => {
        const mockFetcher = vi.fn()
          .mockResolvedValueOnce({
              data: [mockMatch],
              headers: new Headers({ total: '1' })
          })

        await downloadMatchesAsCsv(mockFetcher)

        // Verify fetcher was called correctly
        expect(mockFetcher).toHaveBeenCalledWith('GET /v1/matches', { page: 0, size: 10 })

        // Verify CSV content
        const expectedCsv = 'Match ID,Sport,Date,Start Time,End Time,Venue ID,Court ID,Players\n' +
          '123,TENNIS,2023-01-01,10:00,11:00,venue1,court1,Player 1, Player 2'

        // Verify Blob creation
        expect(global.Blob).toHaveBeenCalledWith([expectedCsv], { type: 'text/csv;charset=utf-8;' })

        // Verify download link creation and cleanup
        expect(document.createElement).toHaveBeenCalledWith('a')
        expect(document.body.appendChild).toHaveBeenCalled()
        expect(document.body.removeChild).toHaveBeenCalled()
        expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
})

describe('downloadCsvFile', () => {
    it('should create a Blob and download the CSV file', () => {
        const csvContent = 'Match ID,Sport,Date,Start Time,End Time,Venue ID,Court ID,Players\n' +
          '123,TENNIS,2023-01-01,10:00,11:00,venue1,court1,Player 1, Player 2'

        // Call the function
        downloadCsvFile(csvContent)

        // Verify Blob creation
        expect(global.Blob).toHaveBeenCalledWith([csvContent], { type: 'text/csv;charset=utf-8;' })

        // Verify URL.createObjectURL was called
        expect(global.URL.createObjectURL).toHaveBeenCalled()

        // Verify link creation and attributes
        const link = document.createElement('a')
        expect(link.setAttribute).toHaveBeenCalledWith('href', 'mock-url')
        expect(link.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/^matches-\d{4}-\d{2}-\d{2}\.csv$/))

        // Verify link was appended to the document and clicked
        expect(document.body.appendChild).toHaveBeenCalledWith(link)
        expect(link.click).toHaveBeenCalled()

        // Verify link was removed from the document and URL was revoked
        expect(document.body.removeChild).toHaveBeenCalledWith(link)
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url')
    })
})