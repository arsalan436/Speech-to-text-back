// routes/transcribe.js
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import { supabase } from '../clients/SupabaseClient.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // ✅ This was missing

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  const audioPath = req.file.path;

  try {
    // 1. Upload file to AssemblyAI
    const uploadResponse = await axios({
      method: 'post',
      url: 'https://api.assemblyai.com/v2/upload',
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY, // 💡 use env variable
        'Transfer-Encoding': 'chunked',
      },
      data: fs.createReadStream(audioPath),
    });

    const audioUrl = uploadResponse.data.upload_url;

    // 2. Request transcription
    const transcriptResponse = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      { audio_url: audioUrl },
      {
        headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
      }
    );

    const transcriptId = transcriptResponse.data.id;

    // 3. Poll until transcription is complete
    let transcriptionText = '';
    let completed = false;

    while (!completed) {
      const pollRes = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
      );

      if (pollRes.data.status === 'completed') {
        transcriptionText = pollRes.data.text;
        completed = true;
      } else if (pollRes.data.status === 'error') {
        throw new Error('Transcription failed.');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // 4. Return transcription
    res.json({ transcription: transcriptionText });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transcription process failed.' });
  } finally {
    fs.unlink(audioPath, () => {}); // clean up temp file
  }
});

// Save transcription note to Supabase
router.post('/save-note', async (req, res) => {
  const { user_id, title, transcription, language = 'en' } = req.body;

  if (!user_id || !transcription) {
    return res.status(400).json({ error: 'Missing user_id or transcription' });
  }

  const { data, error } = await supabase
    .from('transcriptions')
    .insert([
      {
        user_id,
        transcript: transcription,
        audio_url: title || 'Untitled Note', // storing title in `audio_url` column
        language,
      },
    ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save transcription' });
  }

  res.json({ message: 'Note saved successfully', data });
});

router.get('/transcribe/:id', async (req, res) => {
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

router.get('/user-notes/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  const { data, error } = await supabase
    .from('transcriptions') // Your table name
    .select('id, transcript, created_at, audio_url') // ✅ Only fetch required fields
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }

  res.status(200).json(data); // ✅ This now only includes id, text, created_at
});

// DELETE /api/note/:id
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('transcriptions')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Note deleted successfully' });
});

// PUT /api/note/:id
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { audio_url, transcript } = req.body;

  try {
    const { data, error } = await supabase
      .from('transcriptions') // 👈 use your Supabase table name here
      .update({ audio_url, transcript })
      .eq('id', id)
      .select() // to return the updated row

    if (error) {
      console.error('Supabase update error:', error.message);
      return res.status(500).json({ error: 'Failed to update note' });
    }

    res.json(data[0]); // send the updated note
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error while updating note' });
  }
});

// ping api for test 
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});



export default router
