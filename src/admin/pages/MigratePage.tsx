import React from 'react';
import { Link } from 'react-router-dom';
import { Book, DollarSign } from 'lucide-react';

const MigratePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Data Migration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volunteer Data Migration Card */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
          <Link 
            to="/admin/migration/volunteerdata" 
            className="block text-center hover:no-underline"
          >
            <div className="flex flex-col items-center">
              <Book className="w-16 h-16 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Volunteer Data Migration
              </h2>
              <p className="text-gray-600 text-center">
                Migrate and manage volunteer-related data
              </p>
            </div>
          </Link>
        </div>

        {/* Donation Data Migration Card */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
          <Link 
            to="/admin/migration/donationdata" 
            className="block text-center hover:no-underline"
          >
            <div className="flex flex-col items-center">
              <DollarSign className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Donation Data Migration
              </h2>
              <p className="text-gray-600 text-center">
                Migrate and manage donation-related data
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MigratePage;