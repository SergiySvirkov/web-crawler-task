import React, { useState, useEffect, useCallback } from 'react';
import UrlForm from './components/UrlForm';
import ResultsTable from './components/ResultsTable/ResultsTable';
import { getAnalysisResults } from './services/api';
import { AnalysisResult } from './types/analysis';
import './App.css';

function App() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use useCallback to memoize the function, so it's not recreated on every render.
  // This function will be passed down to child components to trigger a data refresh.
  const fetchResults = useCallback(async () => {
    // We don't set loading to true for polling to avoid flickering
    // setIsLoading(true); 
    const data = await getAnalysisResults();
    setResults(data);
    setIsLoading(false); // Set loading to false after the first fetch
  }, []);

  useEffect(() => {
    // Fetch initial data when the component mounts
    fetchResults();

    // Set up polling to get real-time status updates every 5 seconds
    const intervalId = setInterval(() => {
      console.log("Polling for new data...");
      fetchResults();
    }, 5000);

    // Clean up the interval when the component unmounts to prevent memory leaks
    return () => clearInterval(intervalId);
  }, [fetchResults]); // The effect depends on the memoized fetchResults function

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sykell Web Crawler</h1>
        <p>Analysis Dashboard</p>
      </header>
      <main className="App-main">
        {/* Pass the fetchResults function to UrlForm so it can refresh the list after adding a new URL */}
        <UrlForm onUrlAdded={fetchResults} />
        
        {/* Show a loading message only on the initial load */}
        {isLoading && results.length === 0 ? (
          <p>Loading results...</p>
        ) : (
          // Pass the results data and the refresh function to the table component
          <ResultsTable results={results} onRefresh={fetchResults} />
        )}
      </main>
    </div>
  );
}

export default App;
