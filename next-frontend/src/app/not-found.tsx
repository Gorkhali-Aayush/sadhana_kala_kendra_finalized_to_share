
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      {/* Navbar is provided by global layout */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white px-4">
        <h1 className="text-6xl font-bold text-red-600 mb-4 font-Inter">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 font-['Inter']">Page Not Found</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md font-['Roboto']">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 font-['Inter']">
          Go to Home
        </Link>
      </div>
      {/* Footer is provided by global layout */}
    </>
  );
}
