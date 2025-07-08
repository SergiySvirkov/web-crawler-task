import React, { useState, useEffect, useCallback } from 'react';
import UrlForm from './components/UrlForm';
import ResultsTable from './components/ResultsTable/ResultsTable';
import { getAnalysisResults } from './services/api';
import { AnalysisResult } from './types/analysis';
import './App.css';

function App() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    const data = await getAnalysisResults();
    setResults(data);
    setIsLoading(false);
  }, []);

  // This useEffect hook handles both the initial data fetch and the real-time polling.
  useEffect(() => {
    // 1. Fetch initial data as soon as the component mounts.
    fetchResults();

    // 2. Set up an interval to poll for new data every 5 seconds.
    // This will repeatedly call fetchResults to get the latest analysis statuses.
    const intervalId = setInterval(() => {
      console.log("Polling for new data..."); // You can see this message in your browser's console
      fetchResults();
    }, 5000); // 5000 milliseconds = 5 seconds

    // 3. Clean up the interval when the component is unmounted.
    // This is a crucial step to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, [fetchResults]); // The effect depends on the memoized fetchResults function

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
          <ResultsTable results={results} onRefresh={fetchResults} />
        )}
      </main>
    </div>
  );
}

export default App;
