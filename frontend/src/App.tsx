import React, { useState, useEffect, useCallback } from 'react';
import UrlForm from './components/UrlForm';
import ResultsTable from './components/ResultsTable/ResultsTable'; // Updated import path
import { getAnalysisResults } from './services/api';
import { AnalysisResult } from './types/analysis';
import './App.css';

function App() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    const data = await getAnalysisResults();
    // Sort by most recent first by default
    const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setResults(sortedData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Fetch initial data and then poll for updates every 5 seconds
    fetchResults();
    const intervalId = setInterval(fetchResults, 5000); // Polling for real-time updates

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [fetchResults]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sykell Web Crawler</h1>
        <p>Analysis Dashboard</p>
      </header>
      <main className="App-main">
        <UrlForm onUrlAdded={fetchResults} />
        
        {isLoading && results.length === 0 ? (
          <p>Loading results...</p>
        ) : (
          <ResultsTable results={results} />
        )}
      </main>
    </div>
  );
}

export default App;
