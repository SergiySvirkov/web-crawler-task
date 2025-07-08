import axios from 'axios';
import { AnalysisResult } from '../types/analysis';

// The base URL for our backend API. 
// It's a good practice to use an environment variable for this.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create an Axios instance with default settings.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // We will add the Authorization header here later.
  },
});

// A placeholder function to fetch all analysis results.
// We will implement pagination, sorting, and filtering later.
export const getAnalysisResults = async (): Promise<AnalysisResult[]> => {
  try {
    const response = await apiClient.get('/urls');
    return response.data;
  } catch (error) {
    console.error("Error fetching analysis results:", error);
    // In a real app, you'd want to handle this error more gracefully.
    return [];
  }
};

// You can add other API functions here, for example:
// export const addUrlForAnalysis = async (url: string) => { ... };
// export const deleteAnalysis = async (id: number) => { ... };

