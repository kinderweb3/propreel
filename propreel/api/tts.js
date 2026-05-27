export default async function handler(req, res) {
  const { text, voice = 'female' } = req.query;
  if (!text) return res.status(400).json({ error: 'Text required' });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ElevenLabs API key not configured' });

  // Voix françaises ElevenLabs
  const voiceIds = {
    female: 'Xb7hH8MSUJpSbSDYk0k2', // Alice - naturelle, française
    male:   'onwK4e9ZLuTAKqWW03F9',  // Daniel - posé, professionnel
    Celine: 'Xb7hH8MSUJpSbSDYk0k2',
    Mathieu: 'onwK4e9ZLuTAKqWW03F9',
  };
  const voiceId = voiceIds[voice] || voiceIds.female;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: decodeURIComponent(text),
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.95 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ElevenLabs ${response.status}: ${err}`);
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    res.status(500).json({ error: error.message });
  }
}
