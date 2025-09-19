const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

const sampleTutorial = {
  title: "Getting Started with First Principles",
  description: "Learn the fundamental approach to problem-solving that breaks down complex issues into their basic elements.",
  content: `# Getting Started with First Principles

This is a sample tutorial to test the system after recreating the database.

## What Are First Principles?

First principles thinking is a problem-solving technique that involves breaking down complex problems into their most basic, foundational elements. Instead of reasoning by analogy or convention, you start from fundamental truths and build up your understanding from there.

## Why Use First Principles?

1. **Deeper Understanding**: You truly comprehend the subject matter
2. **Innovation**: You're not constrained by existing solutions
3. **Problem Solving**: You can tackle novel challenges effectively
4. **Critical Thinking**: You develop stronger analytical skills

## How to Apply First Principles

### Step 1: Identify the Problem
Clearly define what you're trying to solve or understand.

### Step 2: Break It Down
Decompose the problem into its fundamental components.

### Step 3: Examine Assumptions
Question everything you think you know about the problem.

### Step 4: Rebuild from Scratch
Using only verified facts, construct your understanding anew.

## Example: Electric Cars

When Elon Musk applied first principles to electric cars:

- **Traditional thinking**: "Electric cars are expensive because batteries are expensive"
- **First principles**: "What are the material costs of a battery?"

By examining the raw materials (lithium, cobalt, etc.), he realized batteries could be much cheaper if manufactured differently.

## Conclusion

First principles thinking takes more effort initially but leads to breakthrough insights and robust solutions. Practice this approach consistently to develop your analytical thinking skills.`,
  author: "First Principles Team",
  category: "Fundamentals",
  difficulty: "Beginner",
  readTime: 5,
  githubUrl: "https://github.com/example/first-principles",
  createdAt: new Date()
};

async function initializeDatabase() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log('Connected successfully!');
    
    const db = client.db('first-principles');
    const collection = db.collection('tutorials');
    
    // Check if collection exists and has data
    const count = await collection.countDocuments();
    console.log(`Current tutorial count: ${count}`);
    
    if (count === 0) {
      console.log('Inserting sample tutorial...');
      const result = await collection.insertOne(sampleTutorial);
      console.log('Sample tutorial inserted with ID:', result.insertedId);
    } else {
      console.log('Database already has tutorials. Skipping sample data insertion.');
    }
    
    // Verify the data
    const tutorials = await collection.find({}).toArray();
    console.log(`Total tutorials in database: ${tutorials.length}`);
    
    console.log('Database initialization complete!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed.');
    }
  }
}

initializeDatabase();