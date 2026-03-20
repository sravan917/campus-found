import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimService } from '../api/claimService';
import ErrorMessage from '../components/ErrorMessage';
import './Form.css'; // Reuse form styles

const ClaimPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofText, setProofText] = useState('');

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const data = new FormData();
      data.append('itemId', itemId);
      data.append('proofText', proofText);
      if (proofFile) data.append('proofImage', proofFile);

      await claimService.submitClaim(data);
      alert('Claim submitted successfully! The owner will review your proof.');
      navigate(`/item/${itemId}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("You must be logged in to claim an item. (Firebase Auth missing token)");
      } else {
        setError(err.response?.data?.message || 'Failed to submit claim.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="form-container">
        <h1>Submit Claim</h1>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          Provide descriptive proof that you own this item. If you have a photo of it, please upload it.
        </p>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Proof Description</label>
            <textarea 
              required 
              className="form-control" 
              rows="5" 
              placeholder="e.g. My laptop has a scratch on the bottom left corner..."
              value={proofText} 
              onChange={(e) => setProofText(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Proof Image (optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              className="form-control" 
              onChange={handleFileChange} 
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClaimPage;
