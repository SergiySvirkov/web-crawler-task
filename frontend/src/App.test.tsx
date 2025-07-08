import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './services/api'; // Import the api module to mock it
import { AnalysisResult } from './types/analysis';

// Mock the entire services/api module
// This prevents actual network requests during tests
jest.mock('./services/api');

// Create a typed mock for our API functions
const mockedApi = api as jest.Mocked<typeof api>;

// Sample data to be used in our tests
const mockResults: AnalysisResult[] = [
  {
    id: 1,
    url: 'https://example.com',
    status: 'done',
    pageTitle: 'Example Domain',
    htmlVersion: 'HTML5',
    internalLinksCount: 1,
    externalLinksCount: 0,
    inaccessibleLinksCount: 0,
    hasLoginForm: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    url: 'https://google.com',
    status: 'running',
    pageTitle: 'Google',
    htmlVersion: 'HTML5',
    internalLinksCount: 10,
    externalLinksCount: 5,
    inaccessibleLinksCount: 1,
    hasLoginForm: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('App Component Tests', () => {

  // Before each test, reset the mocks to a clean state
  beforeEach(() => {
    mockedApi.getAnalysisResults.mockClear();
    mockedApi.addUrlForAnalysis.mockClear();
  });

  test('renders the main header and form', () => {
    // For the initial render, mock an empty array so it doesn't complain
    mockedApi.getAnalysisResults.mockResolvedValue([]);
    
    render(<App />);
    
    // Check if the main title is on the screen
    expect(screen.getByText(/Sykell Web Crawler/i)).toBeInTheDocument();
    
    // Check if the URL input form is rendered
    expect(screen.getByPlaceholderText(/Enter a website URL to analyze.../i)).toBeInTheDocument();
  });

  test('fetches and displays analysis results in the table', async () => {
    // Mock the API to return our sample data
    mockedApi.getAnalysisResults.mockResolvedValue(mockResults);

    render(<App />);

    // Wait for the data to be loaded and displayed
    // We search for the URL text from our mock data
    await waitFor(() => {
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('https://google.com')).toBeInTheDocument();
    });

    // Check if the status is correctly displayed
    expect(screen.getByText('done')).toBeInTheDocument();
    expect(screen.getByText('running')).toBeInTheDocument();
  });

  test('allows a user to add a new URL for analysis', async () => {
    // Mock the initial fetch and the add URL function
    mockedApi.getAnalysisResults.mockResolvedValue([]);
    mockedApi.addUrlForAnalysis.mockResolvedValue({ id: 3, status: 'queued' });

    render(<App />);

    // Find the input field and the submit button
    const input = screen.getByPlaceholderText(/Enter a website URL to analyze.../i);
    const button = screen.getByRole('button', { name: /Analyze/i });

    // Simulate user typing a URL into the input field
    const newUrl = 'https://sykell.com';
    fireEvent.change(input, { target: { value: newUrl } });

    // Simulate user clicking the button
    fireEvent.click(button);

    // Wait for the addUrlForAnalysis function to be called and check if it was called correctly
    await waitFor(() => {
      expect(mockedApi.addUrlForAnalysis).toHaveBeenCalledTimes(1);
      expect(mockedApi.addUrlForAnalysis).toHaveBeenCalledWith(newUrl);
    });

    // Also check if the input field was cleared after successful submission
    expect(input).toHaveValue('');
  });
});
