import React, { useState, useEffect } from 'react';
import { itemService } from '../api/itemService';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { Filter } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    location: ''
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Clean up empty filters before sending
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const response = await itemService.getAll(params);
      setItems(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load items. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="container page-wrapper">
      <div className="home-header">
        <h1>Recent Items</h1>
        
        <div className="filters">
          <div className="filter-group">
            <Filter size={18} color="var(--text-muted)" />
            <select name="type" onChange={handleFilterChange} value={filters.type}>
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="filter-group">
            <select name="category" onChange={handleFilterChange} value={filters.category}>
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="documents">Documents</option>
              <option value="keys">Keys</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No items found matching your filters.
        </div>
      )}

      <div className="items-grid">
        {items.map(item => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Home;
