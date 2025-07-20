import { transcribeWithAssemblyAI } from '../assemblyAiClient.js'
import { supabase } from '../supabaseClient.js'

export const handleTranscription = async (req, res) => {
  const { user_id, audio_url, language } = req.body

  if (!user_id || !audio_url) {
    return res.status(400).json({ error: 'Missing user_id or audio_url' })
  }

  try {
    const transcription = await transcribeWithAssemblyAI(audio_url)

    const { text: transcript } = transcription

    const { data, error } = await supabase
      .from('transcriptions')
      .insert([
        {
          user_id,
          audio_url,
          transcript,
          language: language || 'en',
        }
      ])

    if (error) throw error

    res.status(200).json({ message: 'Transcription stored successfully', data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Transcription failed' })
  }
}
