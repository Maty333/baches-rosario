import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../api/auth.js'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Login.css'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const tokenFromQuery = searchParams.get('token') || ''
  const [token, setToken] = useState(tokenFromQuery)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const { showSuccess, showError } = useToast()
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (tokenFromQuery) setToken(tokenFromQuery)
  }, [tokenFromQuery])

  const validatePassword = (pwd) => {
    const newErrors = {}
    if (!pwd) {
      newErrors.password = 'La contraseña es requerida'
    } else {
      if (pwd.length < 6) {
        newErrors.password = 'Mínimo 6 caracteres'
      }
      if (!/[A-Z]/.test(pwd)) {
        newErrors.password = 'Necesita al menos una mayúscula'
      }
      if (!/[a-z]/.test(pwd)) {
        newErrors.password = 'Necesita al menos una minúscula'
      }
      if (!/\d/.test(pwd)) {
        newErrors.password = 'Necesita al menos un número'
      }
    }
    return newErrors
  }

  const validate = () => {
    const newErrors = {}
    if (!token.trim()) {
      newErrors.token = 'Token requerido'
    }
    const pwdErrors = validatePassword(password)
    if (pwdErrors.password) {
      newErrors.password = pwdErrors.password
    }
    if (!confirm) {
      newErrors.confirm = 'Confirmar contraseña requerida'
    } else if (password !== confirm) {
      newErrors.confirm = 'Las contraseñas no coinciden'
    }
    return newErrors
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (errors.password) setErrors({ ...errors, password: undefined })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    try {
      const data = await authAPI.resetPassword(token, password)
      setSuccess(true)
      showSuccess('Contraseña actualizada correctamente')
      setTimeout(async () => {
        if (data?.token) {
          await loginWithToken(data.token)
        }
        navigate('/')
      }, 2000)
    } catch (err) {
      const message = err.response?.data?.message || 'Error al restablecer la contraseña'
      showError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className='login-container'>
        <div className='login-card'>
          <div className='success-message'>
            <h2>✓ Contraseña actualizada</h2>
            <p>Tu contraseña se ha restablecido exitosamente.</p>
            <p className='info-text'>Redirigiendo...</p>
          </div>
        </div>
      </div>
    )
  }

  const passwordStrength = password ? validatePassword(password).password ? 'weak' : 'strong' : ''

  return (
    <div className='login-container'>
      <div className='login-card'>
        <h2>Restablecer Contraseña</h2>
        <p className='form-description'>Elegí una nueva contraseña para tu cuenta.</p>
        <form onSubmit={handleSubmit}>
          {!tokenFromQuery && (
            <div className='form-group'>
              <label htmlFor='token'>Token</label>
              <input
                type='text'
                id='token'
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onBlur={() => setErrors({ ...errors, token: !token.trim() ? 'Token requerido' : undefined })}
                className={errors.token ? 'error' : ''}
                placeholder='Pegá el token del email (ej: abc123...)'
              />
              {errors.token && <span className='error-text'>{errors.token}</span>}
            </div>
          )}

          <div className='form-group'>
            <label htmlFor='password'>Nueva contraseña</label>
            <div className='password-input-wrapper'>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setErrors({ ...errors, password: validatePassword(password).password })}
                className={errors.password ? 'error' : passwordStrength === 'strong' ? 'success' : ''}
                placeholder='Escribí tu nueva contraseña'
              />
              <button
                type='button'
                className='password-toggle'
                onClick={() => setShowPassword(!showPassword)}
                tabIndex='-1'
              >
                {showPassword ? (
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'></path>
                    <line x1='1' y1='1' x2='23' y2='23'></line>
                  </svg>
                ) : (
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'></path>
                    <circle cx='12' cy='12' r='3'></circle>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Requisitos de contraseña */}
            {password && (
              <div className='password-requirements'>
                <div className={`requirement ${password.length >= 6 ? 'met' : 'unmet'}`}>
                  <span className='requirement-icon'>{password.length >= 6 ? '✓' : '○'}</span>
                  <span>Mínimo 6 caracteres ({password.length}/6)</span>
                </div>
                <div className={`requirement ${/[A-Z]/.test(password) ? 'met' : 'unmet'}`}>
                  <span className='requirement-icon'>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                  <span>Una letra mayúscula</span>
                </div>
                <div className={`requirement ${/[a-z]/.test(password) ? 'met' : 'unmet'}`}>
                  <span className='requirement-icon'>{/[a-z]/.test(password) ? '✓' : '○'}</span>
                  <span>Una letra minúscula</span>
                </div>
                <div className={`requirement ${/\d/.test(password) ? 'met' : 'unmet'}`}>
                  <span className='requirement-icon'>{/\d/.test(password) ? '✓' : '○'}</span>
                  <span>Un número</span>
                </div>
              </div>
            )}
            
            {errors.password && <span className='error-text'>{errors.password}</span>}
            {password && !errors.password && <span className='success-text'>✓ Contraseña válida</span>}
          </div>

          <div className='form-group'>
            <label htmlFor='confirm'>Confirmar contraseña</label>
            <input
              type='password'
              id='confirm'
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                if (errors.confirm) setErrors({ ...errors, confirm: undefined })
              }}
              onBlur={() => setErrors({ ...errors, confirm: confirm && password !== confirm ? 'No coincide' : undefined })}
              className={errors.confirm ? 'error' : confirm && password === confirm ? 'success' : ''}
              placeholder='Repetí la contraseña'
            />
            {errors.confirm && <span className='error-text'>{errors.confirm}</span>}
            {confirm && password === confirm && !errors.password && <span className='success-text'>✓ Coincide</span>}
          </div>

          <button type='submit' disabled={loading || !password || !confirm} className='submit-button'>
            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </button>
        </form>

        <p className='register-link'>
          Volver a <Link to='/login'>iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
