import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ToolDetailPage from './pages/ToolDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import SubmitToolPage from './pages/SubmitToolPage';
import AddToolPage from './pages/AddToolPage';
import ForumsPage from './pages/ForumsPage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import NewsletterPage from './pages/NewsletterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ExplorePage from './pages/ExplorePage'; // Import ExplorePage
import TestAdminPage from './pages/TestAdminPage'; // Import TestAdminPage
import AdminAutofillPage from './pages/AdminAutofillPage'; // Import AdminAutofillPage
import EditToolPage from './pages/EditToolPage'; // Import EditToolPage
import AdminReviewPage from './pages/AdminReviewPage'; // Import AdminReviewPage
import DebugAuthPage from './pages/DebugAuthPage'; // Import DebugAuthPage
import { APP_ROUTES } from './constants';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 pt-24"> {/* Added pt-24 for sticky navbar space */}
            <Routes>
              <Route path={APP_ROUTES.HOME} element={<HomePage />} />
              <Route path={APP_ROUTES.EXPLORE} element={<ExplorePage />} /> {/* Add ExplorePage route */}
              <Route path={APP_ROUTES.TOOL_DETAIL} element={<ToolDetailPage />} />
              <Route path={APP_ROUTES.FAVORITES} element={<FavoritesPage />} />
              <Route path={APP_ROUTES.SUBMIT_TOOL} element={<SubmitToolPage />} />
              <Route path={APP_ROUTES.ADD_TOOL} element={<AddToolPage />} />
              <Route path={APP_ROUTES.EDIT_TOOL} element={<EditToolPage />} />
              <Route path={APP_ROUTES.ADMIN_REVIEW} element={<AdminReviewPage />} />
              <Route path={APP_ROUTES.FORUMS} element={<ForumsPage />} />
              <Route path={APP_ROUTES.THREAD_DETAIL} element={<ThreadDetailPage />} />
              <Route path={APP_ROUTES.NEWSLETTER} element={<NewsletterPage />} />
              <Route path={APP_ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path="/test-admin" element={<TestAdminPage />} />
              <Route path="/admin-autofill" element={<AdminAutofillPage />} />
              <Route path="/debug-auth" element={<DebugAuthPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;