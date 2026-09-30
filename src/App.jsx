import { useEffect, useRef, useState } from 'react'
import SunflowerGate from './components/SunflowerGate'
import Montage from './components/Montage'
import Finale from './components/Finale'

export default function App() {
  const [stage, setStage] = useState('gate') // 'gate' | 'montage' | 'finale'
  const audioRef = useRef(null)

  // create the audio element once
  useEffect(() => {
    const audio = new Audio('/music/our-song.mp3')
    audio.volume = 0.85
    audio.preload = 'auto'
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // called from the sunflower click — that counts as a user gesture so autoplay works
  const handleStart = async () => {
    try {
      audioRef.current.currentTime = 0
      await audioRef.current.play()
    } catch (err) {
      console.warn('Autoplay blocked — Montage will show a tap-to-play button.', err)
    }
    setStage('montage')
  }

  // replay from the finale
  const handleReplay = async () => {
    try {
      audioRef.current.currentTime = 0
      await audioRef.current.play()
    } catch (err) {
      console.warn(err)
    }
    setStage('montage')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {stage === 'gate' && <SunflowerGate onStart={handleStart} />}
      {stage === 'montage' && (
        <Montage audioRef={audioRef} onFinish={() => setStage('finale')} />
      )}
      {stage === 'finale' && <Finale onReplay={handleReplay} />}
    </div>
  )
}