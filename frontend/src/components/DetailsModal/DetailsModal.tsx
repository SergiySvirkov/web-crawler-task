import React from 'react';
import { AnalysisResult, HeadingsCount } from '../../types/analysis';
import LinksChart from './LinksChart';
import './DetailsModal.css';

interface DetailsModalProps {
  result: AnalysisResult;
  onClose: () => void; // Function to close the modal
}

// Helper component to display a single detail item
const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value}</span>
  </div>
);

// Helper to render headings count
const renderHeadings = (headings: HeadingsCount | undefined) => {
    if (!headings) return 'N/A';
    return Object.entries(headings)
        .filter(([, count]) => count > 0)
        .map(([tag, count]) => `${tag.toUpperCase()}: ${count}`)
        .join(', ');
};

const DetailsModal: React.FC<DetailsModalProps> = ({ result, onClose }) => {
  // This function stops the click from propagating to the backdrop and closing the modal
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    // The backdrop for the modal
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={handleModalContentClick}>
        <div className="modal-header">
          <h2>Analysis Details</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <DetailItem label="URL" value={<a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a>} />
          <DetailItem label="Page Title" value={result.pageTitle || 'N/A'} />
          <DetailItem label="HTML Version" value={result.htmlVersion || 'N/A'} />
          <DetailItem label="Login Form" value={result.hasLoginForm ? 'Yes' : 'No'} />
          <DetailItem label="Headings Count" value={renderHeadings(result.headingsCountJson)} />
          <DetailItem label="Inaccessible Links" value={result.inaccessibleLinksCount ?? 'N/A'} />

          <div className="chart-container">
            <h3>Links Analysis</h3>
            <LinksChart 
              internal={result.internalLinksCount || 0} 
              external={result.externalLinksCount || 0} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
