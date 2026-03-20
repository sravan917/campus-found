import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';
import './ItemCard.css';

const ItemCard = ({ item }) => {
  const date = new Date(item.date).toLocaleDateString();

  return (
    <Link to={`/item/${item._id}`} className="item-card">
      <div className="card-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
        <span className={`badge badge-${item.type}`}>{item.type.toUpperCase()}</span>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        
        <div className="card-meta">
          <span><Tag size={14} /> {item.category}</span>
          <span><MapPin size={14} /> {item.location}</span>
          <span><Calendar size={14} /> {date}</span>
        </div>
        
        <p className="card-desc">
          {item.description.length > 80 
            ? `${item.description.substring(0, 80)}...` 
            : item.description}
        </p>

        {item.status === 'resolved' && (
          <div className="resolved-banner">Items has been resolved</div>
        )}
      </div>
    </Link>
  );
};

export default ItemCard;
