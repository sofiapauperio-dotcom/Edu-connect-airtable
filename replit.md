# EduConnect × Airtable

## Overview

EduConnect is a Portuguese-language web application that serves as a proxy interface for Airtable operations. The application provides a simple frontend for creating and listing records in Airtable bases without exposing API credentials to the client-side. It features a clean, responsive interface built with Tailwind CSS and handles CRUD operations through a secure Express.js backend that communicates with Airtable's REST API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single-page application** using vanilla HTML, CSS, and JavaScript
- **Tailwind CSS** for styling with a clean, modern interface
- **Client-side JavaScript** handles form interactions and API calls to the backend
- **Responsive design** with mobile-first approach using Tailwind's grid system

### Backend Architecture
- **Express.js server** acting as a secure proxy to Airtable API
- **RESTful API design** with endpoints following `/api/table/:table/records` pattern
- **Environment-based configuration** for sensitive credentials (Base ID and API token)
- **Error handling** with proper HTTP status codes and JSON responses
- **CORS enabled** for cross-origin requests from the frontend

### Security Model
- **API token protection** - Airtable credentials are stored server-side only
- **Proxy pattern** - Frontend never directly accesses Airtable API
- **Environment variables** for secure credential management

### Data Flow
- **Frontend** → Express.js proxy → Airtable API → Response chain back
- **URL encoding** for table names to handle spaces and special characters
- **Query parameter support** for Airtable features like views, filters, and record limits

## External Dependencies

### Core Technologies
- **Express.js** - Web framework for the proxy server
- **node-fetch** - HTTP client for making requests to Airtable API
- **cors** - Cross-origin resource sharing middleware

### Third-party Services
- **Airtable API** - Primary data storage and management service
  - Requires Base ID and Personal Access Token
  - Uses REST API v0 endpoints
  - Supports table operations, views, and filtering
- **Tailwind CSS CDN** - Frontend styling framework loaded from CDN

### Runtime Environment
- **Node.js** with ES modules support
- **Replit deployment** with environment variable management through Secrets
- **HTTP server** running on configurable port for web hosting