import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { setupJwtInterceptors } from "./config/axiosJWT";
import { store } from "./redux/store";
import { refreshAccessToken } from "./services/authService";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import ProfilePage from "./pages/ProfilePage";

import Home from "./pages/Home";
import TourDetailPage from "./pages/TourDetailPage";
import TourBookingPage from "./pages/TourBookingPage";
import NewsPage from "./pages/NewsPage";
import NewsCategoryPage from "./pages/NewsCategoryPage";
import NewsArticlePage from "./pages/NewsArticlePage";
import FaqsPage from "./pages/FaqsPage";
import MainLayout from "./components/layout/MainLayout";
import ScrollToTop from "./components/common/ScrollToTop";

// Staff
import StaffLayout from "./components/layout/StaffLayout";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import StaffAssignments from "./pages/Staff/StaffAssignments";
import StaffTours from "./pages/Staff/StaffTours";

// Admin
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MediaManager from "./pages/Admin/MediaManager";
import CaveManager from "./pages/Admin/CaveManager";
import CaveForm from "./pages/Admin/CaveForm";
import TourManager from "./pages/Admin/TourManager";
import TourForm from "./pages/Admin/TourForm";
import ScheduleManager from "./pages/Admin/ScheduleManager";
import BookingManager from "./pages/Admin/BookingManager";
import AccountManager from "./pages/Admin/AccountManager";
import PostsManagerPage from "./pages/Admin/PostsManagerPage";
import NewsArticleForm from "./pages/Admin/NewsArticleForm";

// Setup axios interceptors once
setupJwtInterceptors(store);

function RedirectLegacyNewsCategory() {
  const { slug } = useParams();
  return <Navigate to={`/news/${slug || ""}`} replace />;
}

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const accessToken = useSelector((state) => state.token.accessToken);

  // Khi reload trang: user vẫn đăng nhập (auth persist) nhưng token mất → tự refresh
  useEffect(() => {
    if (isAuthenticated && !accessToken) {
      refreshAccessToken(dispatch).catch(() => {
        // Refresh thất bại → đã logout trong service
      });
    }
  }, [isAuthenticated, accessToken, dispatch]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<MainLayout />}>
            <Route path="/tour/:code" element={<TourDetailPage />} />
            <Route path="/tour/:code/book" element={<TourBookingPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/category/:slug" element={<RedirectLegacyNewsCategory />} />
            <Route path="/news/:categorySlug" element={<NewsCategoryPage />} />
            <Route path="/news/article/:slug" element={<NewsArticlePage />} />
            <Route path="/faqs" element={<FaqsPage />} />
            <Route path="/" element={<Home />} />
          </Route>

          {/* Manager Routes */}
          <Route path="/manager" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="media" element={<MediaManager />} />
            <Route path="caves" element={<CaveManager />} />
            <Route path="caves/create" element={<CaveForm />} />
            <Route path="caves/edit/:id" element={<CaveForm />} />
            <Route path="tours" element={<TourManager />} />
            <Route path="tours/create" element={<TourForm />} />
            <Route path="tours/edit/:id" element={<TourForm />} />
            <Route path="schedules" element={<ScheduleManager />} />
            <Route path="bookings" element={<BookingManager />} />
            <Route path="accounts" element={<AccountManager />} />
            <Route path="posts" element={<PostsManagerPage />} />
            <Route
              path="news/categories"
              element={<Navigate to="/manager/posts" replace />}
            />
            <Route
              path="news/articles"
              element={
                <Navigate to="/manager/posts" replace state={{ postsTab: 1 }} />
              }
            />
            <Route
              path="faqs"
              element={
                <Navigate to="/manager/posts" replace state={{ postsTab: 2 }} />
              }
            />
            <Route path="news/articles/create" element={<NewsArticleForm />} />
            <Route
              path="news/articles/edit/:id"
              element={<NewsArticleForm />}
            />
          </Route>

          {/* Staff Routes */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="assignments" element={<StaffAssignments />} />
            <Route path="tours" element={<StaffTours />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
