'use client';
import Link from "next/link";

const TopBar = ({ title = "Current Appointment", showBackButton = true }) => {
  return (
    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center">
        {showBackButton && (
          <Link href="/dashboard" className="mr-4 text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>
        )}
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          <img src="/api/placeholder/32/32" alt="Dr Alex Hass" className="w-8 h-8 rounded-full" />
          <span className="text-sm text-gray-700">Dr Alex Hass</span>
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
