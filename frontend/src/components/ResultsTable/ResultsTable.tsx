import React, { useState, useMemo, useEffect } from 'react';
import { AnalysisResult } from '../../types/analysis';
import StatusBadge from './StatusBadge';
import DetailsModal from '../DetailsModal/DetailsModal';
import { deleteUrls, rerunAnalysisForUrls } from '../../services/api'; // Import new functions
import './ResultsTable.css';

interface ResultsTableProps {
  results: AnalysisResult[];
  onRefresh: () => void; // Callback to refresh data after an action
}

type SortConfig = {
  key: keyof AnalysisResult;
  direction: 'ascending' | 'descending';
} | null;

const ResultsTable: React.FC<ResultsTableProps> = ({ results, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const itemsPerPage = 10;

  const processedResults = useMemo(() => {
    // ... (filtering and sorting logic remains the same)
    let processableResults = [...results];
    if (searchTerm) {
      processableResults = processableResults.filter(result =>
        result.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.pageTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      processableResults.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return processableResults;
  }, [results, searchTerm, sortConfig]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedResults.slice(startIndex, startIndex + itemsPerPage);
  }, [processedResults, currentPage]);

  const totalPages = Math.ceil(processedResults.length / itemsPerPage);

  // Clear selection when the underlying data changes to avoid inconsistencies
  useEffect(() => {
    setSelectedIds(new Set());
  }, [results]);

  const handleSelectOne = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allVisibleIds = new Set(paginatedResults.map(r => r.id));
      setSelectedIds(allVisibleIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} item(s)?`)) {
      setIsProcessing(true);
      try {
        await deleteUrls(Array.from(selectedIds));
        onRefresh(); // Refresh data from parent
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRerunSelected = async () => {
    setIsProcessing(true);
    try {
      await rerunAnalysisForUrls(Array.from(selectedIds));
      onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  // ... (requestSort and getSortArrow functions remain the same)
  const requestSort = (key: keyof AnalysisResult) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortArrow = (key: keyof AnalysisResult) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <>
      <div className="results-table-container">
        <input
          type="text"
          placeholder="Search by URL or Title..."
          className="search-input"
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />

        {selectedIds.size > 0 && (
          <div className="bulk-actions-container">
            <span>{selectedIds.size} item(s) selected</span>
            <button onClick={handleRerunSelected} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Re-run Analysis'}
            </button>
            <button onClick={handleDeleteSelected} className="delete-button" disabled={isProcessing}>
              {isProcessing ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        )}

        <table className="results-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={paginatedResults.length > 0 && paginatedResults.every(r => selectedIds.has(r.id))}
                />
              </th>
              <th onClick={() => requestSort('url')}>URL {getSortArrow('url')}</th>
              {/* ... other headers ... */}
              <th onClick={() => requestSort('pageTitle')}>Title {getSortArrow('pageTitle')}</th>
              <th onClick={() => requestSort('status')}>Status {getSortArrow('status')}</th>
              <th onClick={() => requestSort('htmlVersion')}>HTML Ver. {getSortArrow('htmlVersion')}</th>
              <th onClick={() => requestSort('internalLinksCount')}>Internal Links {getSortArrow('internalLinksCount')}</th>
              <th onClick={() => requestSort('externalLinksCount')}>External Links {getSortArrow('externalLinksCount')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedResults.map((result) => (
              <tr key={result.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(result.id)}
                    onChange={() => handleSelectOne(result.id)}
                    onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
                  />
                </td>
                <td data-label="URL" className="url-cell clickable-cell" onClick={() => setSelectedResult(result)}>{result.url}</td>
                {/* ... other cells ... */}
                <td data-label="Title">{result.pageTitle || 'N/A'}</td>
                <td data-label="Status"><StatusBadge status={result.status} /></td>
                <td data-label="HTML Ver.">{result.htmlVersion || 'N/A'}</td>
                <td data-label="Internal Links">{result.internalLinksCount ?? 'N/A'}</td>
                <td data-label="External Links">{result.externalLinksCount ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* ... (pagination controls remain the same) ... */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        )}
      </div>
      
      {selectedResult && (
        <DetailsModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      )}
    </>
  );
};

export default ResultsTable;
