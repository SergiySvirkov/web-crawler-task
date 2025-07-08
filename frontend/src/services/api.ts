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
        throw error;
    }
};

// --- NEW FUNCTIONS FOR BULK ACTIONS ---

/**
 * Deletes multiple URLs by their IDs.
 * @param ids - An array of numbers representing the IDs to delete.
 */
export const deleteUrls = async (ids: number[]): Promise<void> => {
    try {
        // The backend expects a DELETE request with a body.
        await apiClient.delete('/urls', {
            data: { ids },
        });
    } catch (error) {
        console.error("Error deleting URLs:", error);
        alert('Failed to delete selected items.');
        throw error;
    }
};

/**
 * Triggers re-analysis for multiple URLs.
 * @param ids - An array of numbers representing the IDs to re-run.
 */
export const rerunAnalysisForUrls = async (ids: number[]): Promise<void> => {
    try {
        // We run all requests in parallel for better performance.
        const promises = ids.map(id => apiClient.put(`/urls/${id}/process`));
        await Promise.all(promises);
    } catch (error) {
        console.error("Error re-running analysis:", error);
        alert('Failed to re-run analysis for selected items.');
        throw error;
    }
};
