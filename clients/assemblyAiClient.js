import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const ASSEMBLY_API = 'https://api.assemblyai.com/v2'
const headers = {
  authorization: process.env.ASSEMBLYAI_API_KEY,
  'content-type': 'application/json',
}

export const transcribeWithAssemblyAI = async (audioUrl) => {
  try {
    // Step 1: Submit transcription request
    const { data: transcriptInit } = await axios.post(`${ASSEMBLY_API}/transcript`, {
      audio_url: audioUrl,
    }, { headers })

    const transcriptId = transcriptInit.id

    // Step 2: Poll until complete
    let transcriptData = null
    while (true) {
      const { data: statusData } = await axios.get(`${ASSEMBLY_API}/transcript/${transcriptId}`, {
        headers
      })

      if (statusData.status === 'completed') {
        transcriptData = statusData
        break
      } else if (statusData.status === 'error') {
        throw new Error(`Transcription failed: ${statusData.error}`)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    return transcriptData
  } catch (error) {
    console.error('AssemblyAI Transcription Error:', error)
    throw error
  }
}
