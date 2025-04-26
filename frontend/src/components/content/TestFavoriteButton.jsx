import React, { useState } from 'react';
import { toggleFavoriteSong } from '../../services/musicApi';

const TestFavoriteButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Thử với ID bài hát 1
      const response = await toggleFavoriteSong(1);
      setResult(response);
    } catch (error) {
      console.error('Lỗi khi toggle favorite:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#282828', borderRadius: '8px', margin: '20px' }}>
      <h2 style={{ color: '#fff', marginBottom: '16px' }}>Test Favorite Button</h2>
      
      <button 
        onClick={handleClick}
        disabled={isLoading}
        style={{
          backgroundColor: '#1db954',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '30px',
          border: 'none',
          fontWeight: 'bold',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Đang xử lý...' : 'Toggle Favorite (Song ID: 1)'}
      </button>
      
      {result && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#1db954', color: '#fff', borderRadius: '4px' }}>
          <p>Kết quả: {JSON.stringify(result)}</p>
        </div>
      )}
      
      {error && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e22134', color: '#fff', borderRadius: '4px' }}>
          <p>Lỗi: {error}</p>
        </div>
      )}
    </div>
  );
};

export default TestFavoriteButton;
