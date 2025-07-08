import React, { useState, useEffect, useCallback } from 'react';
import UrlForm from './components/UrlForm';
import { getAnalysisResults } from './services/api';
import { AnalysisResult } from './types/analysis';
import './App.css';

function App() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use useCallback to memoize the function, so it's not recreated on every render
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    const data = await getAnalysisResults();
    setResults(data);
    setIsLoading(false);
  }, []);

  // Fetch initial data when the component mounts
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sykell Web Crawler</h1>
        <p>Analysis Dashboard</p>
      </header>
      <main className="App-main">
        <UrlForm onUrlAdded={fetchResults} />
        
        {/* We will add the results table here in the next step */}
        {isLoading ? (
          <p>Loading results...</p>
        ) : (
          <div>
            <h2>Analysis Results ({results.length})</h2>
            {/* Placeholder for the table */}
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
