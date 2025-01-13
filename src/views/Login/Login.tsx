import { FormEventHandler, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField
} from '@mui/material'
import { useAuth } from '@/lib/auth'

export interface LoginProps {
  initialValues?: {
    email?: string
    password?: string
  }
}

export function Login(props: LoginProps) {
  const { initialValues, ...otherProps } = props

  const auth = useAuth()
  const [email, setEmail] = useState(initialValues?.email ?? '')
  const [password, setPassword] = useState(initialValues?.password ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault()
    setError(null)
    setIsSubmitting(true)

    auth.login({ email, password })
      .catch(err => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => { setIsSubmitting(false) })
  }

  return (
    <Box
      {...otherProps}
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundImage: `url('/banner.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Container maxWidth="xs" sx={{ my: 4, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src="/playtomic.svg"
            sx={{
              width: 80,
              height: 80,
              mb: 2
            }}
          />
          {error && (
            <Alert
              severity="error"
              onClose={() => { setError(null) }}
              sx={{ width: '100%', mb: 2 }}
            >
              {error}
            </Alert>
          )}
          <Paper
            component="form"
            aria-label="Log in"
            aria-busy={isSubmitting ? 'true' : undefined}
            onSubmit={handleSubmit}
            sx={{
              p: 4,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '4px'
            }}
          >
            <TextField
              required
              fullWidth
              label="Email"
              type="email"
              name="email"  // Add name attribute
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              disabled={isSubmitting}
              autoComplete="email"
              autoFocus
              inputProps={{
                'aria-label': 'Email'
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <TextField
              required
              fullWidth
              label="Password"
              type="password"
              name="password"  // Add name attribute
              value={password}
              onChange={(e) => { setPassword(e.target.value) }}
              disabled={isSubmitting}
              autoComplete="current-password"
              inputProps={{
                'aria-label': 'Password'
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderRadius: 100,
                backgroundColor: '#335FFF',
                '&:hover': {
                  backgroundColor: '#2548CC'
                }
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Log in'
              )}
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}
