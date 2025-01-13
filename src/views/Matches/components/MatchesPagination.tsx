import TablePagination from '@mui/material/TablePagination'
import PropTypes from 'prop-types'

interface MatchesPaginationProps {
  total: number
  page: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

const MatchesPagination: React.FC<MatchesPaginationProps> = ({ total, page, size, onPageChange, onSizeChange }) => (
  <TablePagination
    component="div"
    count={total}
    page={page}
    rowsPerPage={size}
    onPageChange={(_, newPage) => { onPageChange(newPage) }}
    onRowsPerPageChange={ev => {
      onSizeChange(parseInt(ev.target.value, 10))
      onPageChange(0)
    }}
  />
)

MatchesPagination.propTypes = {
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
}

export default MatchesPagination