import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import CombinedSearchResults from '../search/CombinedSearchResults';
import useSearchStore from '../../store/searchStore';
import './SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const { resetSearch } = useSearchStore();

  // Lấy query từ URL khi component được mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchTerm(query);

    // Reset trạng thái tìm kiếm khi unmount
    return () => {
      resetSearch();
    };
  }, [location.search, resetSearch]);

  // Xử lý khi submit form tìm kiếm
  const handleSubmit = (e) => {
    e.preventDefault();

    // Cập nhật URL với query mới
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    }

    const newUrl = `${location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="search-page">
      <CombinedSearchResults query={searchTerm} />
    </div>
  );
};

export default SearchPage;
