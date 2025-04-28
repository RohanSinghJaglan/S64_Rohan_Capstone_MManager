import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import NotificationMenu from './NotificationMenu'

const Navbar = () => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const { token, userData, logout } = useContext(AppContext)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Default profile image if user doesn't have one
  const defaultProfileImage = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error', error)
    }
  }

  return (
    <nav className='sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex-shrink-0'>
            <img onClick={() => navigate('/')} className='h-8 w-auto cursor-pointer' src={assets.logo} alt="Logo" />
          </div>
          
          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              <NavLink to='/' className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                }`}>
                Home
              </NavLink>
              <NavLink to='/doctors' className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                }`}>
                Doctors
              </NavLink>
              
              <div className='relative group'>
                <button className='px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary group-hover:text-primary transition-colors'>
                  Features
                </button>
                <div className='absolute left-0 pt-2 w-48 hidden group-hover:block'>
                  <div className='rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
                    <div className='py-1'>
                      <NavLink to='/voice-assistant' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        Voice Assistant
                      </NavLink>
                      <NavLink to='/skin-analyzer' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        Skin Analyzer
                      </NavLink>
                      <NavLink to='/medication-adviser' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        AI Medication Adviser
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>

              <NavLink to='/about' className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                }`}>
                About
              </NavLink>
              <NavLink to='/contact' className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                }`}>
                Contact
              </NavLink>
            </div>
          </div>

          <div className='flex items-center'>
            {token && userData ? (
              <div className='relative group'>
                <button className='flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary focus:outline-none'>
                  <img 
                    className='h-8 w-8 rounded-full object-cover'
                    src={userData.image || defaultProfileImage}
                    alt={userData.name}
                  />
                  <span className="hidden md:block">{userData.name}</span>
                  <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                </button>
                <div className='absolute right-0 pt-2 w-48 hidden group-hover:block'>
                  <div className='rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
                    <div className='py-1'>
                      <button onClick={() => navigate('/my-profile')} className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        My Profile
                      </button>
                      <button onClick={() => navigate('/my-appointments')} className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        My Appointments
                      </button>
                      {userData.role === 'admin' && (
                        <button onClick={() => navigate('/admin')} className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                          Admin Panel
                        </button>
                      )}
                      <button onClick={handleLogout} className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className='ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hidden md:block'
              >
                Sign in
              </button>
            )}
            
            <button onClick={() => setShowMenu(true)} className='md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none'>
              <img className='h-6 w-6' src={assets.menu_icon} alt="Menu" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden fixed inset-0 z-50 bg-white transform ${showMenu ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className='pt-5 pb-6 px-5'>
          <div className='flex items-center justify-between'>
            <div>
              <img className='h-8 w-auto' src={assets.logo} alt="Logo" />
            </div>
            <div>
              <button onClick={() => setShowMenu(false)} className='rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none'>
                <img className='h-6 w-6' src={assets.cross_icon} alt="Close menu" />
              </button>
            </div>
          </div>
          <div className='mt-6'>
            <nav className='grid gap-y-4'>
              <NavLink
                to='/'
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to='/doctors'
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`
                }
              >
                Doctors
              </NavLink>
              <div className='space-y-1'>
                <p className='px-3 py-2 text-base font-medium text-gray-700'>Features</p>
                <NavLink
                  to='/voice-assistant'
                  onClick={() => setShowMenu(false)}
                  className='block pl-6 pr-3 py-2 text-base font-medium text-gray-500 hover:text-primary'
                >
                  Voice Assistant
                </NavLink>
                <NavLink
                  to='/skin-analyzer'
                  onClick={() => setShowMenu(false)}
                  className='block pl-6 pr-3 py-2 text-base font-medium text-gray-500 hover:text-primary'
                >
                  Skin Analyzer
                </NavLink>
                <NavLink
                  to='/medication-adviser'
                  onClick={() => setShowMenu(false)}
                  className='block pl-6 pr-3 py-2 text-base font-medium text-gray-500 hover:text-primary'
                >
                  AI Medication Adviser
                </NavLink>
              </div>
              <NavLink
                to='/about'
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`
                }
              >
                About
              </NavLink>
              <NavLink
                to='/contact'
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`
                }
              >
                Contact
              </NavLink>
              {token && userData && (
                <>
                  <NavLink
                    to='/my-profile'
                    onClick={() => setShowMenu(false)}
                    className='px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary'
                  >
                    My Profile
                  </NavLink>
                  <NavLink
                    to='/my-appointments'
                    onClick={() => setShowMenu(false)}
                    className='px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary'
                  >
                    My Appointments
                  </NavLink>
                  {userData.role === 'admin' && (
                    <NavLink
                      to='/admin'
                      onClick={() => setShowMenu(false)}
                      className='px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary'
                    >
                      Admin Panel
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className='px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary w-full text-left'
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
        {!token && (
          <div className='pt-4 pb-3 border-t border-gray-200'>
            <div className='px-5'>
              <button
                onClick={() => {
                  navigate('/login');
                  setShowMenu(false);
                }}
                className='block w-full px-4 py-2 text-center text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md'
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar