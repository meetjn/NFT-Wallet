
# Project Setup Guide

## Installation

To install dependencies while avoiding conflicts, run:
```bash
npm i --legacy-peer-deps
```

## Running the Proxy Server

To resolve CORS issues, start the proxy server:

1. Navigate to the proxy directory:
```bash
cd proxy
```

2. Start the server:
```bash
node server.js
```

## Notes
- The `--legacy-peer-deps` flag is used to bypass dependency conflicts
- The proxy server must be running to handle CORS (Cross-Origin Resource Sharing) requests properly
- Make sure all dependencies are installed before starting the proxy server

## Issues
If you encounter any problems, please ensure:
- Node.js is installed on your system
- You're in the correct directory when running commands
- All required dependencies are listed in package.json
