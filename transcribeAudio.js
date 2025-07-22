import { transcribeWithAssemblyAI } from './assemblyAiClient.js'
import { supabase } from './SupabaseClient.js'

// Call this with the audio URL and user ID
export const processAndStoreTranscription = async (userId, audioUrl, language = 'en') => {
  const transcription = await transcribeWithAssemblyAI(audioUrl)

  const { text: transcript } = transcription

  const { data, error } = await supabase
    .from('transcriptions')
    .insert([
      {
        user_id: userId,
        audio_url: audioUrl,
        transcript,
        language,
      }
    ])

  if (error) {
    console.error('Supabase insert error:', error)
    throw error
  }

  return data
}
