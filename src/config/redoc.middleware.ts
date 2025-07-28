import { Express } from 'express';
import redoc from 'redoc-express';

export function setupRedoc(app: Express) {
  const redocOptions = {
    title: 'Qualityflow API Documentation',
    version: '1.0',
    specUrl: '/api-json',
    hideHostname: true,
    theme: {
      typography: { 
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5em',
        code: {
          fontSize: '13px',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
        },
        headings: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '600',
        },
      },
      colors: {
        primary: { main: '#6366f1' },
        text: { 
          primary: '#ffffff', 
          secondary: '#bbbbbb' 
        },
        http: {
          get: '#61affe',
          post: '#49cc90',
          put: '#fca130',
          delete: '#f93e3e',
        },
        responses: {
          '2xx': '#4caf50',
          '3xx': '#2196f3',
          '4xx': '#ff9800',
          '5xx': '#f44336',
        },
        background: {
          page: '#121212',
          content: '#1e1e1e',
        },
        sidebar: {
          backgroundColor: '#1e1e1e',
          textColor: '#ffffff',
          groupItems: '#333333',
        },
      },
    },
  };

  app.use('/docs', redoc(redocOptions));
} 