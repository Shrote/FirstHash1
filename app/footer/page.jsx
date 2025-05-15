import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const version = '1.0.0';

  return (
    <div className="w-full py-3 text-center text-white bg-gray-900 fixed bottom-0 left-0">
      <p>
        © {currentYear} || Made with 🤍 by{' '}
        <a
          href="https://www.evidyut.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Shrote Technologies.
        </a>
        {' '}for{' '}
        <a 
          href='https://www.qpoindia.com' 
          target='_blank' 
          rel="noopener noreferrer" 
          className="text-blue-400 hover:underline"
        >
          First Hash.
        </a>
      </p>
      <span className="absolute right-4 bottom-4 text-xs text-gray-300">
        v{version}
      </span>
      
    </div>
  );
}