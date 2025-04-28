import React, { Suspense } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import VoiceAssistant from './pages/VoiceAssistant'
import SkinDiseaseAnalyzer from './pages/SkinDiseaseAnalyzer'
import AuthCallback from './pages/AuthCallback'
import MedicationAdviser from './components/MedicationAdviser'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  console.log('App rendering...');  // Debug log
  
  return (
    <ErrorBoundary>
      <div className='mx-4 sm:mx-[10%]'>
        <ToastContainer />
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/doctors/:speciality' element={<Doctors />} />
            <Route path='/login' element={<Login />} />
            <Route path='/admin/login' element={<AdminLogin />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/appointment/:docId' element={<Appointment />} />
            <Route path='/my-appointments' element={<MyAppointments />} />
            <Route path='/my-profile' element={<MyProfile />} />
            <Route path='/verify' element={<Verify />} />
            <Route path='/voice-assistant' element={<VoiceAssistant />} />
            <Route path='/skin-analyzer' element={<SkinDiseaseAnalyzer />} />
            <Route path='/medication-adviser' element={<MedicationAdviser />} />
            <Route path='/auth/callback' element={<AuthCallback />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default App