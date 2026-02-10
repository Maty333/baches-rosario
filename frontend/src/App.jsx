import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RouteGuard from './components/common/RouteGuard.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Navbar from './components/common/Navbar.jsx'
import ConnectionStatus from './components/common/ConnectionStatus.jsx'

import Home from './views/Home.jsx'
import Login from './views/Login.jsx'
import Register from './views/Register.jsx'
import ForgotPassword from './views/ForgotPassword.jsx'
import ResetPassword from './views/ResetPassword.jsx'
import BacheDetail from './views/BacheDetail.jsx'
import ReportBache from './views/ReportBache.jsx'
import AdminPanel from './views/AdminPanel.jsx'
import GoogleCallback from './views/GoogleCallback.jsx'

// Routes guarded by authentication/authorization are handled by `RouteGuard`.

function App () {
  return (
    <Router>
      <div className='App'>
        <ConnectionStatus />
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/register' element={<Register />} />
          <Route path='/auth/google/callback' element={<GoogleCallback />} />
          <Route path='/bache/:id' element={<BacheDetail />} />
          <Route
            path='/reportar'
            element={
              <RouteGuard>
                <ReportBache />
              </RouteGuard>
            }
          />
          <Route
            path='/admin'
            element={
              <RouteGuard requireAdmin={true}>
                <AdminPanel />
              </RouteGuard>
            }
          />
        </Routes>
        <ToastContainer
          position='top-right'
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
          limit={5}
        />
      </div>
    </Router>
  )
}

export default App
