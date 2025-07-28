// Custom start script
console.log('Starting the React application...');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'node_modules', 'react-scripts', 'scripts', 'start.js');
console.log(`Using script path: ${scriptPath}`);

try {
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
} catch (error) {
    console.error('Failed to start the application:', error);
}
