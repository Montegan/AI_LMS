import React from 'react'

function FeatureButton({ icon, label }) {
    return (
      <button className="flex items-center justify-center px-2 text-nowrap py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
        
        <span className="text-sm">{label}</span>
      </button>
    );
  }

  export default FeatureButton;