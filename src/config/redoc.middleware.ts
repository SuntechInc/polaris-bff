import { Express } from 'express';
import redoc from 'redoc-express';

export function setupRedoc(app: Express) {
  const redocOptions = {
    title: 'Polaris BFF API Documentation',
    version: '1.0',
    specUrl: '/api-json',
    theme: {
      colors: {
        primary: {
          main: '#2c3e50',
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
        },
        gray: {
          50: '#f8f9fa',
          100: '#e9ecef',
        },
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5em',
        code: {
          fontSize: '13px',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        },
        headings: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '600',
        },
      },
      sidebar: {
        backgroundColor: '#f8f9fa',
        textColor: '#2c3e50',
      },
    },
  };

  app.use('/docs', redoc(redocOptions));
} 