// routes/transcribe.js
import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { audio_url } = req.body

    if (!audio_url) {
      return res.status(400).json({ error: 'Audio URL is required' })
    }

    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ audio_url }),
    })

    const data = await response.json()

    res.status(200).json({ transcript_id: data.id, status: data.status })
  } catch (error) {
    console.error('Error during transcription:', error)
    res.status(500).json({ error: 'Failed to transcribe audio' })
  }
})



router.get('/:id', async (req, res) => {
  const transcriptId = req.params.id;

  try {
    const pollingRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
      },
    });

    if (!pollingRes.ok) {
      const errorText = await pollingRes.text();
      return res.status(pollingRes.status).json({
        error: `AssemblyAI error: ${pollingRes.status} ${pollingRes.statusText}`,
        message: errorText,
      });
    }

    const data = await pollingRes.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong while polling transcription' });
  }
});


export default router


