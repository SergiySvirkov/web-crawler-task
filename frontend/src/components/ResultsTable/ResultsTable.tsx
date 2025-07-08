import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../../types/analysis';
import StatusBadge from './StatusBadge';
import DetailsModal from '../DetailsModal/DetailsModal'; // Import the modal
import './ResultsTable.css';

interface ResultsTableProps {
  results: AnalysisResult[];
}

type SortConfig = {
  key: keyof AnalysisResult;
  direction: 'ascending' | 'descending';
} | null;

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State to manage the selected result for the modal view
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  const processedResults = useMemo(() => {
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <table className="results-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('url')}>URL {getSortArrow('url')}</th>
              <th onClick={() => requestSort('pageTitle')}>Title {getSortArrow('pageTitle')}</th>
              <th onClick={() => requestSort('status')}>Status {getSortArrow('status')}</th>
              <th onClick={() => requestSort('htmlVersion')}>HTML Ver. {getSortArrow('htmlVersion')}</th>
              <th onClick={() => requestSort('internalLinksCount')}>Internal Links {getSortArrow('internalLinksCount')}</th>
              <th onClick={() => requestSort('externalLinksCount')}>External Links {getSortArrow('externalLinksCount')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedResults.length > 0 ? (
              paginatedResults.map((result) => (
                // Add onClick handler to the table row
                <tr key={result.id} onClick={() => setSelectedResult(result)} className="clickable-row">
                  <td data-label="URL" className="url-cell">{result.url}</td>
                  <td data-label="Title">{result.pageTitle || 'N/A'}</td>
                  <td data-label="Status"><StatusBadge status={result.status} /></td>
                  <td data-label="HTML Ver.">{result.htmlVersion || 'N/A'}</td>
                  <td data-label="Internal Links">{result.internalLinksCount ?? 'N/A'}</td>
                  <td data-label="External Links">{result.externalLinksCount ?? 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No results found.</td>
              </tr>
            )}
          </tbody>
        </table>
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
      
      {/* Render the modal if a result is selected */}
      {selectedResult && (
        <DetailsModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      )}
    </>
  );
};

export default ResultsTable;
