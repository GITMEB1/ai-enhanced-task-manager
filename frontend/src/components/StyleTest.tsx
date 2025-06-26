import React from 'react';

export const StyleTest: React.FC = () => {
  return (
    <div className="p-8 bg-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Tailwind CSS Test</h1>
      <p className="text-lg">If you can see this styled properly, Tailwind is working!</p>
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded">
          Green Button
        </button>
        <button className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded">
          Red Button
        </button>
      </div>
    </div>
  );
}; 