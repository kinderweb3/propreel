export default async function handler(req, res) {
  const { text, voice = 'female' } = req.query;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ElevenLabs key missing' });

  const voiceMap = {
    female:  'cgSgspJ2msm6clMCkdW9',
    male:    'CwhRBWXzGAHq8TQ4Fs17',
    Celine:  'cgSgspJ2msm6clMCkdW9',
    Mathieu: 'CwhRBWXzGAHq8TQ4Fs17',
  };
  const voiceId = voiceMap[voice] || voiceMap.female;

  try {
    // with-timestamps endpoint → retourne audio + timing exact de chaque caractère
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
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

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ElevenLabs ${response.status}: ${err}`);
    }

    const data = await response.json();
    // Retourner audio base64 + alignment pour sync sous-titres parfaite
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({
      audio: data.audio_base64,
      alignment: data.alignment || null,
    });
  } catch (err) {
    console.error('ElevenLabs TTS error:', err);
    res.status(500).json({ error: err.message });
  }
}
