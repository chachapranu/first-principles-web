const fetch = require('node-fetch');

const sampleData = {
  githubUrl: "https://raw.githubusercontent.com/example/repo/main/tutorial.md"
};

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test tutorials endpoint
    console.log('\n2. Testing tutorials endpoint...');
    const tutorialsResponse = await fetch('http://localhost:3000/api/tutorials');
    const tutorialsData = await tutorialsResponse.json();
    console.log('Tutorials:', tutorialsData);
    
    console.log('\n✅ API endpoints are working!');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3000/admin');
    console.log('2. Login with admin@example.com / admin123');
    console.log('3. Add tutorials using GitHub URLs');
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();