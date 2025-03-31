  import React from "react";
  import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
  import spotifyLogo from "../../assets/images/spotify.png";


  const Navbar = () => {
    return (
      <div className="spotify-navbar">
        {/* Logo Spotify */}
        <div className="logo-container">
          <img src={spotifyLogo} alt="Spotify Logo" className="spotify-logo" />
        </div>
  
        <div className="search-container" style={{ flex: 1, marginLeft: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '365px' }}>
            <FaSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#b3b3b3' }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo bài hát, nghệ sĩ hoặc album" 
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
          <button className="btn btn-login">Đăng nhập</button>
        </div>
      </div>
    );
  };
  
  export default Navbar;
