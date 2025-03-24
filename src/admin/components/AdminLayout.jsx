// components/AdminLayout.jsx
import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader'; // Assuming AdminHeader is in the same directory

const AdminLayout = ({ children, user, handleLogout, title }) => {
  return (
    <div className="h-screen bg-gray-100 flex flex-col ">
      <AdminHeader user={user} handleLogout={handleLogout} title={title} className="fixed"/>
      <div className="flex flex-1">
        <AdminSidebar  />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;