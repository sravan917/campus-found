import React, { useState, useEffect } from 'react';
import { itemService } from '../api/itemService';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './Home.css'; // Reuse home grid styles

const MyPosts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        setLoading(true);
        if (!currentUser) return;
        
        // Pass the query param down to Axios
        const response = await itemService.getAll({ postedBy: currentUser.uid });
        setItems(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load items.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyItems();
  }, [currentUser]);

  return (
    <div className="container page-wrapper">
      <div className="home-header">
        <h1>My Posts</h1>
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}

      <div className="items-grid">
        {items.map(item => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MyPosts;
