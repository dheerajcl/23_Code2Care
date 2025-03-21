import React, { useState, useEffect } from 'react';

const AdminRegister = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = "Join\nAdmin!";
  const [showEmoji, setShowEmoji] = useState(false);
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setShowEmoji(true);
        }, 300);
      }
    }, 150);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  return (
    <div className="flex h-screen">
      {/* Left side with blue background */}
      <div className="w-1/2 bg-blue-600 flex flex-col justify-center p-16 text-white">
        <div className="mb-6">
          <span className="text-8xl">*</span>
        </div>
        <h1 className="text-6xl font-bold mb-2">
          {displayText.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < displayText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
          {showEmoji && <span className="ml-2 mt-4 inline-block animate-bounce">✨</span>}
        </h1>
        <p className="mt-6">
          Create your admin account to access powerful tools
          and manage your platform with ease and efficiency.
        </p>
      </div>

      {/* Right side with registration form */}
      <div className="w-1/2 flex flex-col justify-center p-16">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold mb-1">Samarth Connect</h2>
          <h3 className="text-xl font-medium mb-8">Register Admin Account</h3>
          <p className="text-sm mb-6">
            Already have an account? <a href="/admin/login" className="text-blue-600 underline">Login here</a>.
          </p>

          <form>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <input 
                  type="text" 
                  placeholder="First Name" 
                  className="w-full border border-gray-300 p-3 rounded-md"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  className="w-full border border-gray-300 p-3 rounded-md"
                />
              </div>
            </div>
            <div className="mb-4">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full border border-gray-300 p-3 rounded-md"
              />
            </div>
            <div className="mb-4">
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full border border-gray-300 p-3 rounded-md"
              />
            </div>
            <div className="mb-6">
              <input 
                type="password" 
                placeholder="Confirm Password" 
                className="w-full border border-gray-300 p-3 rounded-md"
              />
            </div>
            <div className="mb-6 flex items-start">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 mr-2"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-blue-600">Terms of Service</a> and <a href="#" className="text-blue-600">Privacy Policy</a>
              </label>
            </div>
            <button 
              type="submit" 
              className="w-full bg-black text-white py-3 rounded-md mb-4"
            >
              Register Now
            </button>
            <button 
              type="button" 
              className="w-full border border-gray-300 py-3 rounded-md flex items-center justify-center mb-4"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" className="mr-2">
                <path 
                  d="M19.6 10.2c0-.7-.1-1.3-.2-1.9h-9.5v3.7h5.5c-.2 1.2-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.3z" 
                  fill="#4285F4" 
                />
                <path 
                  d="M10 20c2.8 0 5.2-1 7-2.6l-3.4-2.5c-1 .6-2.2 1-3.6 1-2.8 0-5.1-1.9-6-4.4H.5v2.6C2.2 17.8 5.8 20 10 20z" 
                  fill="#34A853" 
                />
                <path 
                  d="M4 11.5c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2V4.9H.5A9.96 9.96 0 0 0 0 10c0 1.6.4 3.2 1 4.5l3-2.3z" 
                  fill="#FBBC05" 
                />
                <path 
                  d="M10 3.6c1.6 0 3 .6 4.1 1.6l3-3C15.3.8 12.9 0 10 0 5.8 0 2.2 2.2.5 5.9l3.5 2.6c.9-2.5 3.2-4.4 6-4.4z" 
                  fill="#EA4335" 
                />
              </svg>
              Register with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;