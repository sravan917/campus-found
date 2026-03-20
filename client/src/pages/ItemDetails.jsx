import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemService } from '../api/itemService';
import { claimService } from '../api/claimService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { MapPin, Calendar, Tag, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import './ItemDetails.css';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItemAndClaims = async () => {
      try {
        const itemRes = await itemService.getById(id);
        const itemData = itemRes.data;
        setItem(itemData);

        // If the current user is the owner, fetch the claims
        if (currentUser && currentUser.uid === itemData.postedBy) {
          try {
            const claimsRes = await claimService.getClaimsForItem(id);
            setClaims(claimsRes.data);
          } catch (claimErr) {
            console.error("Failed to fetch claims", claimErr);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load item.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemAndClaims();
  }, [id, currentUser]);

  const handleClaimAction = async (claimId, status) => {
    try {
      if (!window.confirm(`Are you sure you want to ${status} this claim?`)) return;
      
      await claimService.updateClaimStatus(claimId, status);
      
      // Update local state
      setClaims(claims.map(c => c._id === claimId ? { ...c, status } : c));
      
      if (status === 'approved') {
        setItem({ ...item, status: 'resolved' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to completely delete this item? This action is permanent!')) return;
    try {
      await itemService.delete(id);
      navigate('/my-posts');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="container page-wrapper"><ErrorMessage message={error} /></div>;
  if (!item) return null;

  return (
    <div className="container page-wrapper">
      <div className="details-card">
        <div className="details-image">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} />
          ) : (
            <div className="placeholder-image">No Image Provided</div>
          )}
          <span className={`badge badge-${item.type}`}>{item.type.toUpperCase()}</span>
        </div>

        <div className="details-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1>{item.title}</h1>
            {currentUser && currentUser.uid === item.postedBy && (
              <button onClick={handleDeletePost} className="btn" style={{ background: 'transparent', color: 'var(--danger)', padding: '0.5rem' }} title="Delete Post">
                <Trash2 size={20} />
              </button>
            )}
          </div>
          
          {item.status === 'resolved' && (
            <div className="resolved-banner" style={{ margin: '1rem 0' }}>
              This item has been resolved and returned to its owner!
            </div>
          )}

          <div className="meta-grid">
            <div className="meta-item">
              <Tag size={18} />
              <div>
                <small>Category</small>
                <p>{item.category}</p>
              </div>
            </div>
            <div className="meta-item">
              <MapPin size={18} />
              <div>
                <small>Location</small>
                <p>{item.location}</p>
              </div>
            </div>
            <div className="meta-item">
              <Calendar size={18} />
              <div>
                <small>Date</small>
                <p>{new Date(item.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="description-box">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>

          {/* Action area for NON-OWNERS to claim an open item */}
          {item.status === 'open' && (!currentUser || currentUser.uid !== item.postedBy) && (
            <div className="action-area">
              <div className="alert-box">
                <AlertCircle size={20} />
                <span>Are you the owner? Claim it by providing proof.</span>
              </div>
              <Link to={`/claim/${item._id}`} className="btn btn-primary">
                Claim this Item
              </Link>
            </div>
          )}

          {/* Action area for OWNERS to manage claims */}
          {currentUser && currentUser.uid === item.postedBy && (
            <div className="owner-claims-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Manage Claims ({claims.length})</h3>
              
              {claims.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No one has submitted a claim for this item yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {claims.map(claim => (
                    <div key={claim._id} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--background)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                          Claimed on: {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`badge badge-${claim.status === 'pending' ? 'lost' : 'found'}`} style={{ position: 'static' }}>
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <p style={{ margin: '0 0 1rem 0', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                        <strong>Proof Description:</strong><br />
                        {claim.proofText}
                      </p>
                      
                      {claim.proofImageUrl && (
                        <div style={{ marginBottom: '1rem' }}>
                          <img 
                            src={claim.proofImageUrl} 
                            alt="Proof evidence" 
                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
                          />
                        </div>
                      )}
                      
                      {claim.status === 'pending' && item.status === 'open' && (
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                          <button 
                            onClick={() => handleClaimAction(claim._id, 'approved')} 
                            className="btn btn-primary" 
                            style={{ background: 'var(--secondary)' }}
                          >
                            <CheckCircle size={16} /> Approve Claim
                          </button>
                          <button 
                            onClick={() => handleClaimAction(claim._id, 'rejected')} 
                            className="btn btn-outline" 
                            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}
                      
                      {claim.status === 'rejected' && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--danger)' }}>
                          You have rejected this claim.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
