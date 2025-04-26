import React, { useState } from 'react';
import { toggleFavoriteSong, checkFavoriteSong } from '../services/musicApi';

const TestPage = () => {
  const [songId, setSongId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [checkResult, setCheckResult] = useState(null);

  const handleToggle = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('Gọi toggleFavoriteSong với songId:', songId);
      const response = await toggleFavoriteSong(songId);
      console.log('Kết quả toggle favorite:', response);
      setResult(response);
    } catch (error) {
      console.error('Lỗi khi toggle favorite:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async () => {
    setIsLoading(true);
    setError(null);
    setCheckResult(null);
    
    try {
      console.log('Gọi checkFavoriteSong với songId:', songId);
      const response = await checkFavoriteSong(songId);
      console.log('Kết quả check favorite:', response);
      setCheckResult(response);
    } catch (error) {
      console.error('Lỗi khi check favorite:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ marginBottom: '24px' }}>Test Favorite Functionality</h1>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Song ID:
          <input 
            type="number" 
            value={songId}
            onChange={(e) => setSongId(Number(e.target.value))}
            style={{
              marginLeft: '12px',
              padding: '8px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px'
            }}
          />
        </label>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={handleToggle}
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
          {isLoading ? 'Đang xử lý...' : 'Toggle Favorite'}
        </button>
        
        <button 
          onClick={handleCheck}
          disabled={isLoading}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '30px',
            border: '1px solid #555',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Đang xử lý...' : 'Check Favorite Status'}
        </button>
      </div>
      
      {result && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1db954', color: '#fff', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '8px' }}>Toggle Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      {checkResult && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#333', color: '#fff', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '8px' }}>Check Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(checkResult, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#e22134', color: '#fff', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '8px' }}>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default TestPage;
