import axios from 'axios';
import { AnalysisResult } from '../types/analysis';

// Get API URL and Token from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const API_TOKEN = process.env.REACT_APP_API_TOKEN;

// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add the Authorization header to all requests
    'Authorization': `Bearer ${API_TOKEN}`,
  },
});

// Function to fetch all analysis results
export const getAnalysisResults = async (): Promise<AnalysisResult[]> => {
  try {
    const response = await apiClient.get('/urls');
    return response.data;
  } catch (error) {
    console.error("Error fetching analysis results:", error);
    // In a real app, you'd want to handle this error more gracefully
    alert('Failed to fetch data. Is the backend running and the API token correct?');
    return [];
  }
};

// Function to add a new URL for analysis
export const addUrlForAnalysis = async (url: string): Promise<any> => {
    try {
        const response = await apiClient.post('/urls', { url });
        return response.data;
    } catch (error) {
        console.error("Error adding URL:", error);
        alert('Failed to add URL. Please check the URL and try again.');
        throw error; // Re-throw the error to be caught by the component
    }
}

// We will add more API functions here later (e.g., for deleting, re-running analysis)
