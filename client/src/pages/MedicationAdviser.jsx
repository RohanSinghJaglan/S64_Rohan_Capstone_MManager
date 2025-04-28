import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const MedicationAdviser = () => {
  const { userData } = useContext(AppContext);
  const [formData, setFormData] = useState({
    symptoms: '',
    age: '',
    gender: 'male',
    allergies: '',
    medicalHistory: ''
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.symptoms.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }

    if (!formData.age || isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      toast.error('Please enter a valid age between 1 and 120');
      return;
    }

    setLoading(true);
    setRecommendations(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/recommendations`, formData);
      if (response.data.success) {
        setRecommendations(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast.error('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {userData?.role === 'admin' && (
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="mr-4 p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title="Admin Panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <h2 className="text-2xl font-semibold text-gray-800">Medication Adviser</h2>
        </div>
      </div>
      
      {showAdminPanel && userData?.role === 'admin' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Admin Panel</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Total Recommendations</p>
                  <p className="text-xl font-semibold">347</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Today's Requests</p>
                  <p className="text-xl font-semibold">24</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Average Response Time</p>
                  <p className="text-xl font-semibold">1.2s</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Actions</h4>
              <div className="flex space-x-3">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Download Reports
                </button>
                <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                  Configure AI
                </button>
                <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
              Describe your symptoms *
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={4}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Describe your symptoms in detail"
              required
            />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="1"
                max="120"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                Allergies
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any medication allergies"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
            Medical History
          </label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            rows={3}
            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            value={formData.medicalHistory}
            onChange={handleChange}
            placeholder="Any relevant medical history or current medications"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
          <p className="mt-2 text-gray-600">Analyzing your symptoms...</p>
        </div>
      )}

      {recommendations && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h3>
          
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  This is AI-generated advice for informational purposes only. Always consult with a healthcare professional before taking any medication.
                </p>
              </div>
            </div>
          </div>
          
          <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: recommendations.html }}></div>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500">
        <p>* Required fields</p>
        <p className="mt-2">
          <strong>Disclaimer:</strong> This tool provides general information and is not a substitute for professional medical advice. 
          Always consult with a qualified healthcare provider for diagnosis and treatment.
        </p>
      </div>
    </div>
  );
};

export default MedicationAdviser; 