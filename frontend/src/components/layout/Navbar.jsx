import React from "react";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";

const Navbar = () => {
  return (
    <div className="spotify-navbar">
      <div className="navigation-controls">
        <FaChevronLeft className="me-3" style={{ fontSize: '1.5rem', opacity: 0.7 }} />
        <FaChevronRight style={{ fontSize: '1.5rem', opacity: 0.7 }} />
      </div>
      <div className="search-container" style={{ flex: 1, marginLeft: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '365px' }}>
          <FaSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#b3b3b3' }} />
          <input 
            type="text" 
            placeholder="Search for Artists, Songs, or Podcasts" 
            style={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '23px',
              padding: '10px 10px 10px 35px',
              width: '100%',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>
      <div>
        <button className="btn btn-login">Login</button>
      </div>
    </div>
  );
};

export default Navbar;