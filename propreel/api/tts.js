export default async function handler(req, res) {
  const { text, voice = 'female' } = req.query;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ElevenLabs key missing' });

  // Meilleures voix françaises ElevenLabs — naturelles et expressives
  const voiceMap = {
    female:  'cgSgspJ2msm6clMCkdW9', // Jessica — chaleureuse, naturelle
    male:    'CwhRBWXzGAHq8TQ4Fs17', // Roger — posé, professionnel
    Celine:  'cgSgspJ2msm6clMCkdW9',
    Mathieu: 'CwhRBWXzGAHq8TQ4Fs17',
  };
  const voiceId = voiceMap[voice] || voiceMap.female;

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
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`ElevenLabs ${response.status}: ${await response.text()}`);
    const buf = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(buf));
  } catch (err) {
    console.error('ElevenLabs TTS error:', err);
    res.status(500).json({ error: err.message });
  }
}
