import React, { useState } from 'react';
import { addUrlForAnalysis } from '../services/api';
import './UrlForm.css'; // We will create this file for styling

// Define the props for the component
interface UrlFormProps {
  onUrlAdded: () => void; // A callback function to notify the parent when a URL is added
}

const UrlForm: React.FC<UrlFormProps> = ({ onUrlAdded }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission
    
    // Simple validation
    if (!url || !url.startsWith('http')) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      await addUrlForAnalysis(url);
      setUrl(''); // Clear the input field on success
      onUrlAdded(); // Notify the parent component to refresh its data
    } catch (err) {
      // The error is already logged in the api service, but we can set a state here if needed
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="url-form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a website URL to analyze..."
          className="url-input"
          disabled={isLoading}
        />
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default UrlForm;
