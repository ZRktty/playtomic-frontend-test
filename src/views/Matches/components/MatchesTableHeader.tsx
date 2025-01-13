import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'

const MatchesTableHeader: React.FC = () => (
  <TableHead>
    <TableRow>
      <TableCell>Sport</TableCell>
      <TableCell>Date</TableCell>
      <TableCell>Start</TableCell>
      <TableCell>End</TableCell>
      <TableCell>Players</TableCell>
    </TableRow>
  </TableHead>
)

export default MatchesTableHeader