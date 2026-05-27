export default async function handler(req, res) {
  const { text, voice = 'Celine' } = req.query;
  if (!text) return res.status(400).json({ error: 'Text required' });

  try {
    // StreamElements TTS — gratuit, aucune clé nécessaire
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('TTS service error: ' + response.status);
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
