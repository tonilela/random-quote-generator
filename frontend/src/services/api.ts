import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

async function graphqlRequest(query: string, variables: Record<string, any> = {}) {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/graphql`,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
}
const getApiMode = () => localStorage.getItem('apiMode') || 'rest';

export const getRandomQuote = async () => {
  if (getApiMode() === 'graphql') {
    const query = `
      query GetRandom {
        randomQuote { id, content, author, totalLikes, averageRating, liked, userRating }
      }`;
    const data = await graphqlRequest(query);
    return data.randomQuote;
  } else {
    const response = await apiClient.get('/api/quotes/random');
    return response.data;
  }
};

export const likeQuote = async (quoteId: number) => {
  if (getApiMode() === 'graphql') {
    const mutation = `
      mutation LikeAQuote($quoteId: Int!) {
        likeQuote(quoteId: $quoteId) { id, totalLikes }
      }`;
    const data = await graphqlRequest(mutation, { quoteId });
    return data.likeQuote;
  } else {
    const response = await apiClient.post(`/api/quotes/${quoteId}/like`);
    return response.data;
  }
};

export const rateQuote = async (quoteId: number, rating: number) => {
  if (getApiMode() === 'graphql') {
    const mutation = `
      mutation RateAQuote($quoteId: Int!, $rating: Int!) {
        rateQuote(quoteId: $quoteId, rating: $rating) { id, averageRating, totalRatings }
      }`;
    const data = await graphqlRequest(mutation, { quoteId, rating });
    return data.rateQuote;
  } else {
    const response = await apiClient.post(`/api/quotes/${quoteId}/rate`, { rating });
    return response.data;
  }
};

export const searchQuotes = async (searchTerm: string) => {
  if (searchTerm.trim().length < 2) return [];
  if (getApiMode() === 'graphql') {
    const query = `
      query Search($term: String!) {
        searchQuotes(term: $term) { id, content, author, liked, userRating, totalLikes, averageRating }
      }`;
    const data = await graphqlRequest(query, { term: searchTerm });
    return data.searchQuotes;
  } else {
    const response = await apiClient.get('/api/quotes/search', { params: { q: searchTerm } });
    return response.data;
  }
};

export const getLikedQuotes = async () => {
  if (getApiMode() === 'graphql') {
    const query = `
      query GetFavorites {
        likedQuotes { id, content, author, userRating, totalLikes, averageRating }
      }`;
    const data = await graphqlRequest(query);
    return data.likedQuotes;
  } else {
    const response = await apiClient.get('/api/quotes/liked');
    return response.data;
  }
};

export const registerUser = async (name: string, email: string, password: string) => {
  if (getApiMode() === 'graphql') {
    const mutation = `
      mutation Register($name: String!, $email: String!, $password: String!) {
        register(name: $name, email: $email, password: $password) { id, name, email }
      }`;
    const data = await graphqlRequest(mutation, { name, email, password });
    return data.register;
  } else {
    const response = await apiClient.post('/api/auth/register', { name, email, password });
    return response.data;
  }
};

export const loginUser = async (email: string, password: string) => {
  if (getApiMode() === 'graphql') {
    const mutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) { token, user { id, name, email } }
      }`;
    const data = await graphqlRequest(mutation, { email, password });
    return data.login;
  } else {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  }
};
