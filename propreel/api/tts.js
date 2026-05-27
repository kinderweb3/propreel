export default async function handler(req, res) {
  const { text, voice = 'fr' } = req.query;
  if (!text) return res.status(400).json({ error: 'Text required' });

  // Essayer plusieurs services TTS gratuits
  const services = [
    // Service 1: StreamElements
    async () => {
      const voices = { Celine: 'Celine', Mathieu: 'Mathieu' };
      const v = voices[voice] || 'Celine';
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${v}&text=${encodeURIComponent(text)}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw new Error('StreamElements ' + r.status);
      return r;
    },
    // Service 2: VoiceRSS (gratuit, pas de clé pour fr)
    async () => {
      const url = `https://api.voicerss.org/?key=none&hl=fr-fr&src=${encodeURIComponent(text)}&c=MP3&f=44khz_16bit_mono`;
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw new Error('VoiceRSS ' + r.status);
      return r;
    },
    // Service 3: tts.mp3 (Google TTS non officiel)
    async () => {
      const chunks = text.match(/.{1,200}/g) || [text];
      const chunk = chunks[0];
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=fr&client=gtx&ttsspeed=0.9`;
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000)
      });
      if (!r.ok) throw new Error('GoogleTTS ' + r.status);
      return r;
    }
  ];

  for (const service of services) {
    try {
      const response = await service();
      const buf = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(Buffer.from(buf));
      return;
    } catch (e) {
      console.error('TTS service failed:', e.message);
    }
  }

  res.status(500).json({ error: 'All TTS services unavailable' });
}
