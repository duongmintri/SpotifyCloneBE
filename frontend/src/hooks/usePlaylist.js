import { useState, useEffect } from 'react';
import axios from 'axios';

const usePlaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/playlists/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlaylists(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch playlists');
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return { playlists, loading, error, refreshPlaylists: fetchPlaylists };
};

export default usePlaylist;