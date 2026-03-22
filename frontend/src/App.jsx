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
import TourBookingPage from './pages/TourBookingPage'
import MainLayout from './components/layout/MainLayout'

// Staff
import StaffLayout from './components/layout/StaffLayout'
import StaffAssignments from './pages/Staff/StaffAssignments'
import StaffTours from './pages/Staff/StaffTours'

// Admin
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import MediaManager from './pages/Admin/MediaManager'
import CaveManager from './pages/Admin/CaveManager'
import CaveForm from './pages/Admin/CaveForm'
import TourManager from './pages/Admin/TourManager'
import TourForm from './pages/Admin/TourForm'
import ScheduleManager from './pages/Admin/ScheduleManager'
import BookingManager from './pages/Admin/BookingManager'
import AccountManager from './pages/Admin/AccountManager'

// Setup axios interceptors once
setupJwtInterceptors(store)

function App() {

  return (
    <>
      <Toaster position='top-right' richColors />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/signin' element={<SignInPage />} />
          <Route path='/profile' element={<ProfilePage />} />

          <Route element={<MainLayout />}>
            <Route path='/tour/:code' element={<TourDetailPage />} />
            <Route path='/tour/:code/book' element={<TourBookingPage />} />
            <Route path='/' element={<Home />} />
          </Route>

          {/* Manager Routes */}
          <Route path='/manager' element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path='media' element={<MediaManager />} />
            <Route path='caves' element={<CaveManager />} />
            <Route path='caves/create' element={<CaveForm />} />
            <Route path='caves/edit/:id' element={<CaveForm />} />
            <Route path='tours' element={<TourManager />} />
            <Route path='tours/create' element={<TourForm />} />
            <Route path='tours/edit/:id' element={<TourForm />} />
            <Route path='schedules' element={<ScheduleManager />} />
            <Route path='bookings' element={<BookingManager />} />
            <Route path='accounts' element={<AccountManager />} />
          </Route>

          {/* Staff Routes */}
          <Route path='/staff' element={<StaffLayout />}>
            <Route index element={<StaffAssignments />} />
            <Route path='assignments' element={<StaffAssignments />} />
            <Route path='tours' element={<StaffTours />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
