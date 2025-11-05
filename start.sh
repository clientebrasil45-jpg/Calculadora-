#!/bin/bash

# Start the backend server in the background
node server.js &

# Wait a moment for the backend to start
sleep 2

# Start the frontend dev server
npm run frontend
