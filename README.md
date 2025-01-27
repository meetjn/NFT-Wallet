# Contributing

1. Fork the repository. (See the button on top left)
2. Clone the forked repository on your machine
3. To run the Frontend run the following commands
```
npm install
```

followed by 

```
npm run dev
```

Now this will start frontend code localhost:3000

4. To make contributions create your own branch with your name
5. Add all the changes by the using the command

   ```
   gid add .
   ```

   followed by

   ```
   git commit -m "your commit message"
   ```

   lastly,
```
   git push -u origin "your branch name here"
```

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
