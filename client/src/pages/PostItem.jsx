import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../api/itemService';
import ErrorMessage from '../components/ErrorMessage';
import './Form.css';

const PostItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: 'electronics',
    location: 'library',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (imageFile) data.append('image', imageFile);

      const response = await itemService.create(data);
      navigate(`/item/${response.data._id}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("You must be logged in to post an item. (Firebase Auth missing token)");
      } else {
        setError(err.response?.data?.message || 'Failed to post item.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="form-container">
        <h1>Post an Item</h1>
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input required name="title" className="form-control" value={formData.title} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
                <option value="lost">I lost this</option>
                <option value="found">I found this</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="documents">Documents</option>
                <option value="keys">Keys</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <select name="location" className="form-control" value={formData.location} onChange={handleChange}>
                <option value="library">Library</option>
                <option value="cafeteria">Cafeteria</option>
                <option value="lecture-hall">Lecture Hall</option>
                <option value="hostel">Hostel</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" required name="date" className="form-control" value={formData.date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Description (include detailed marks/brands)</label>
            <textarea required name="description" className="form-control" rows="4" value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-group">
            <label>Upload Image (optional)</label>
            <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Posting to Cloudinary...' : 'Post Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostItem;
