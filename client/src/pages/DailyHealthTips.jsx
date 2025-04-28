import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DailyHealthTips = () => {
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch a health tip when component mounts
    fetchHealthTip();
  }, []);

  const fetchHealthTip = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ai/healthTip`);
      if (response.data.success) {
        setTip(response.data.data.tip);
      } else {
        setTip('Unable to load today\'s health tip. Please try again later.');
        toast.error(response.data.message || 'Failed to load health tip');
      }
    } catch (error) {
      console.error('Error fetching health tip:', error);
      setTip('Unable to load today\'s health tip. Please try again later.');
      toast.error('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const refreshTip = () => {
    fetchHealthTip();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Daily Health Tip</h2>
        <button
          onClick={refreshTip}
          disabled={loading}
          className="text-primary hover:text-primary-dark"
          title="Get a new tip"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="border-l-4 border-primary pl-4 py-2">
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 italic">{tip}</p>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>AI-generated health tips are provided for informational purposes only.</p>
      </div>
    </div>
  );
};

export default DailyHealthTips; 