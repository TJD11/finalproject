import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && <p className="mt-3 text-secondary-custom">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
