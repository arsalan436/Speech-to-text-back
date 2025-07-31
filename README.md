
# Speech-to-Text App – Backend

This is the backend of my Speech-to-Text app. It is built with Node.js and Express. It receives audio files from the frontend and sends them to the AssemblyAI API for transcription. It also saves the transcriptions to Supabase.

## 📁 Folder Structure

backend/
├── app.js // Main Express server file
├── routes/ // All API routes
├── .env // API keys and secrets
├── package.json


## 🚀 How to Run the Backend

1. Make sure Node.js and npm are installed on your system.

2. Open terminal in the `backend/` folder and run:


npm install

    Create a .env file in the root of the backend/ folder and add:

PORT=5000
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_or_service_role_key

    Start the server:

npm start

It will run on http://localhost:5000.
🛠 Features

    Accept audio files from frontend.

    Send files to AssemblyAI for transcription.

    Save transcription results in Supabase.

    Poll AssemblyAI for transcription status.

    Expose API endpoints for frontend to fetch and save data.

🔗 API Endpoints

    POST /api/transcribe – Send audio URL for transcription.

    GET /api/transcribe/:id – Poll transcription status.

    POST /api/save-transcription – Save final transcription to Supabase.

    GET /api/transcriptions/:user_id – Fetch all saved transcriptions for a user.

## DEployment

The backend of this project is deployed using Render.

I pushed my backend code to GitHub and then went to Render. There, I clicked on “Create Web Service” and chose to deploy from GitHub. I selected the backend repository for this project and configured the necessary environment variables required by the app.

Render automatically picked up the build and start commands from my package.json file. After finishing the setup, I deployed the backend service. Once deployed, Render gave me a live backend API URL, which I’ve used in my frontend app to make API calls.