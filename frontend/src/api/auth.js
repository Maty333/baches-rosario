import { api } from '../utils/axiosConfig.js'

export const authAPI = {
  register: async (email, password, nombre, apellido, edad, sexo) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      nombre,
      apellido,
      edad,
      sexo
    })
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  getMe: async token => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  updateProfile: async (token, profileData) => {
    const response = await api.put('/auth/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  getGoogleAuthUrl: async () => {
    const response = await api.get('/auth/google/url')
    return response.data
  },

  googleCallback: async code => {
    const response = await api.get(`/auth/google/callback?code=${code}`)
    return response.data
  },

  forgotPassword: async email => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password })
    return response.data
  }
}
