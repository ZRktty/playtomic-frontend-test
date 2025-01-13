import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Chip from '@mui/material/Chip'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { Match } from '@/lib/api-types'

interface MatchesTableRowProps {
  match: Match
}

function MatchesTableRow({ match }: MatchesTableRowProps) {
  // Remember, match dates look like: 2024-01-04T09:00Z
  const startDate = match.startDate.substring(0, 10)
  const startTime = match.startDate.substring(11, 16)
  const endTime = match.endDate.substring(11, 16)

  return (
    <TableRow>
      <TableCell>
        <Chip size="small" label={match.sport} />
      </TableCell>
      <TableCell>{startDate}</TableCell>
      <TableCell>{startTime}</TableCell>
      <TableCell>{endTime}</TableCell>
      <TableCell align="left">
        <AvatarGroup max={4} sx={{ flexDirection: 'row' }}>
          {match.teams.flatMap(team => team.players).map(player => (
            <Avatar 
              key={player.userId}
              sx={{ width: 28, height: 28 }}
              alt={player.displayName}
              src={player.pictureURL ?? undefined}
            />
          ))}
        </AvatarGroup>
      </TableCell>
    </TableRow>
  )
}

export default MatchesTableRow;