# Assist Agent React

## Problem Statement
This project addresses the need for an interactive AI assistant interface with proper markdown rendering capabilities. It provides a user-friendly chat interface that correctly displays formatted content, including proper spacing, bullet points, and hierarchical structure.

## Detailed Proposal & Prototype Plan
The application consists of a React frontend and a FastAPI backend that work together to provide an AI assistant experience:

1. Frontend: React application with TypeScript and Tailwind CSS for styling
2. Backend: FastAPI server with MongoDB for chat storage
3. Communication: RESTful API endpoints for chat interaction
4. Features: Markdown rendering, theme toggling, and responsive design

## Project Structure
The project is organized into two main directories:
- `frontend/`: Contains all React frontend code and assets
- `backend/`: Contains the FastAPI backend server and database integration

## Features Implemented
- Chat interface with message history
- Proper markdown rendering for all messages
- Theme toggle (light/dark mode)
- Responsive design for mobile and desktop
- Backend API integration
- Search functionality with results display
- Sidebar for navigation

## Tech Stack Used
- **Frontend**:
  - React with TypeScript
  - Vite as build tool
  - Tailwind CSS for styling
  - React Markdown for content rendering
  - React Router for navigation
  
- **Backend**:
  - FastAPI (Python)
  - MongoDB for data storage
  - Uvicorn as ASGI server
  - LangChain for AI integration

## Contribution Details

## B. Amarendra Nadh:

Designed and integrated the AI agent using LangChain

Tuned conversational flow for better context handling

Worked on connecting the backend to the assistant logic

## Ruchir:

Implemented the initial FastAPI server setup

Configured MongoDB integration for storing chat history

Developed base RESTful API endpoints for communication

## A. Nikhilesh:

Extended backend functionality with search API endpoints

Improved error handling and backend request validation

Optimized database queries for faster response times

## Vaishnavi:

Built the frontend chat interface with React + TypeScript

Integrated React Markdown for proper message rendering

Implemented responsive design for mobile and desktop

## Varshini:

Developed the sidebar navigation and theme toggle (light/dark mode)

Integrated API calls with the frontend to display results

Fixed UI/UX issues and polished styling with Tailwind CSS

## Getting Started
1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd backend && pip install -r requirements.txt`
4. Start the frontend: `cd frontend && npm run dev`
5. Start the backend: `cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`
6. Open your browser to http://localhost:8080

## Recent Fixes
- Fixed markdown rendering in message bubbles
- Resolved CSS linting errors for Tailwind directives
- Fixed backend connection issues
- Reorganized project structure for better maintainability
