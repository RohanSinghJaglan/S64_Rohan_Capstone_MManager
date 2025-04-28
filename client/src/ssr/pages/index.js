import { useQuery } from '@apollo/client';
import Head from 'next/head';
import Link from 'next/link';
import { GET_DOCTORS } from '../../graphql/queries';
import { initializeApollo } from '../lib/apollo-client';
import Navbar from '../../components/Navbar';

export default function Home({ initialDoctors }) {
  // Client-side query to keep data fresh
  const { data, loading, error } = useQuery(GET_DOCTORS, {
    // Initialize with SSR fetched data
    initialData: { getDoctors: initialDoctors },
  });

  const doctors = data?.getDoctors || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Prescripto - Healthcare App</title>
        <meta name="description" content="Book appointments with top doctors" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Specialized Doctors
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Book appointments with the best doctors near you and get instant medical advice.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
            <p>Error loading doctors: {error.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                    <img
                      src={doctor.image || 'https://via.placeholder.com/150?text=Doctor'}
                      alt={`Dr. ${doctor.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Dr. {doctor.name}</h2>
                    <p className="text-gray-600">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p><span className="font-medium">Experience:</span> {doctor.experience} years</p>
                  <p><span className="font-medium">Fees:</span> ₹{doctor.fees}</p>
                  {doctor.rating && (
                    <p className="flex items-center mt-1">
                      <span className="font-medium mr-1">Rating:</span>
                      <span className="flex items-center">
                        {doctor.rating}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-yellow-500 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                      </span>
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <Link href={`/appointment/${doctor._id}`} className="block w-full text-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300">
                    Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} Prescripto. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Server-side rendering
export async function getServerSideProps() {
  const apolloClient = initializeApollo();

  try {
    const { data } = await apolloClient.query({
      query: GET_DOCTORS,
    });

    return {
      props: {
        initialDoctors: data.getDoctors || [],
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  } catch (error) {
    console.error('Error fetching SSR data:', error);
    return {
      props: {
        initialDoctors: [],
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  }
} 