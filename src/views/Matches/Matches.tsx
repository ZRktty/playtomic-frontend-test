import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import useMatches from "./useMatches.ts";
import MatchesTableHeader from "./components/MatchesTableHeader.tsx";
import MatchesTableRow from "./components/MatchesTableRow.tsx";
import MatchesPagination from "./components/MatchesPagination.tsx";

export interface MatchesProps {
  onLogoutRequest?: () => void
}

export function Matches(props: MatchesProps) {
  const {onLogoutRequest, ...otherProps} = props
  const {matches, total, page, size, setPage, setSize} = useMatches()

  return (
    <Stack {...otherProps}>
      <Stack direction="row" marginBottom={2} justifyContent="space-between" alignItems="center">
        <Typography variant="h2">Matches</Typography>
        <Stack direction="row" justifyContent="space-between">
          <Button size="small" onClick={onLogoutRequest}>Logout</Button>
        </Stack>
      </Stack>
      <TableContainer component={Paper}>
        <Table sx={{minWidth: 650}} aria-label="Matches">
          <MatchesTableHeader/>
          <TableBody>
            {matches.map((match) => (
                <MatchesTableRow key={match.matchId} match={match}/>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <MatchesPagination
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        onSizeChange={setSize}
      />
    </Stack>
  )
}
