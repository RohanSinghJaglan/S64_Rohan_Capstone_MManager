import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import { assets } from '../assets/assets'

const Home = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test if assets are loading
    try {
      console.log('Assets test:', {
        header: assets.header_img,
        logo: assets.logo,
        profiles: assets.group_profiles
      });
    } catch (err) {
      console.error('Assets loading error:', err);
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading page: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <Header />
      </div>
      <div className="mb-8">
        <SpecialityMenu />
      </div>
      <div className="mb-8">
        <TopDoctors />
      </div>
      <div className="mb-8">
        <Banner />
      </div>
    </div>
  )
}

export default Home;