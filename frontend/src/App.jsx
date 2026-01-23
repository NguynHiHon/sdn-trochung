
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { setupJwtInterceptors } from './config/axiosJWT'
import { store } from './redux/store'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import ProfilePage from './pages/ProfilePage'

// Setup axios interceptors once
setupJwtInterceptors(store)

function App() {

  return (
    <>
      <Toaster position='top-right' richColors/>
      <Router>
        <Routes>
          <Route path='/signup' element={<SignUpPage/>}/>
          <Route path='/signin' element={<SignInPage/>}/>
          <Route path='/profile' element={<ProfilePage/>}/>
          <Route path='/' element={<ProfilePage/>}/>
        </Routes>
      </Router> 
    </>
  )
}

export default App
