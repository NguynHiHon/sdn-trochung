
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { setupJwtInterceptors } from './config/axiosJWT'
import { store } from './redux/store'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import ProfilePage from './pages/ProfilePage'

import Home from './pages/Home'
import TourDetailPage from './pages/TourDetailPage'
import MainLayout from './components/layout/MainLayout'

// Setup axios interceptors once
setupJwtInterceptors(store)

function App() {

  return (
    <>
      <Toaster position='top-right' richColors />
      <Router>
        <Routes>
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/signin' element={<SignInPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route element={<MainLayout />}>
            <Route path='/tour/:id' element={<TourDetailPage />} />
            <Route path='/' element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
