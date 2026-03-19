import React, { useState, useRef, useEffect } from 'react';
import { processImage } from './engine/utils';
import { findEdges } from './engine/segmenter';
import { startAnimation, recordCanvas } from './engine/animator';

const { createFFmpeg } = FFmpeg;

function App() {
  const [status, setStatus] = useState('idle'); // idle, processing, ready, generating, transcoding, done, error
  const [videoUrl, setVideoUrl] = useState(null);
  const [progress, setProgress] = useState('');
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isolationStatus, setIsolationStatus] = useState('Checking...');
  const canvasRef = useRef(null);
  const dataRef = useRef(null);
  const ffmpegRef = useRef(null);

  useEffect(() => {
    // Check isolation
    setIsolationStatus(window.crossOriginIsolated ? 'Isolated (Safe)' : 'NOT Isolated (Will Fail)');

    // Load ffmpeg on mount
    const loadFFmpeg = async () => {
      try {
        const ffmpeg = createFFmpeg({
          corePath: `${window.location.origin}/assets/ffmpeg-core.js`,
          log: true,
        });
        ffmpeg.setLogger(({ type, message }) => {
          if (type === 'fferr') setProgress(message);
          console.log(type, message);
        });
        ffmpeg.setProgress(({ ratio }) => {
          if (ratio >= 0 && ratio <= 1) {
            setProgress(`Transcoding... ${(ratio * 100).toFixed(1)}%`);
          }
        });
        await ffmpeg.load();
        ffmpegRef.current = ffmpeg;
        setFfmpegLoaded(true);
      } catch (err) {
        console.error('FFmpeg Load Error:', err);
        setStatus('error');
        setProgress(`FFmpeg Failed to Load: ${err.message}. Check console for details.`);
        // Try to fetch the core path manually to see if it's a network issue
        fetch('/assets/ffmpeg-core.js')
          .then(r => console.log('Manual fetch of ffmpeg-core.js:', r.status, r.statusText))
          .catch(e => console.error('Manual fetch of ffmpeg-core.js failed:', e));
      }
    };
    loadFFmpeg();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('processing');
    setProgress('Processing image (Downscaling & Quantizing)...');
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();

      const processedData = processImage(img, 1200, 6);
      dataRef.current = processedData;

      const { canvas, quantizedData, width, height } = processedData;
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      ctx.putImageData(new ImageData(quantizedData, width, height), 0, 0);

      setStatus('ready');
      setProgress('');
    } catch (err) {
      setStatus('error');
      setProgress(`Processing Error: ${err.message}`);
    }
  };

  const handleGenerate = async () => {
    if (!ffmpegLoaded) {
      alert('FFmpeg is still loading, please wait a moment.');
      return;
    }

    setStatus('generating');
    setProgress('Segmenting image in background...');
    const { width, height, quantizedData, palette } = dataRef.current;

    const worker = new Worker(new URL('./engine/segmenter.worker.js', import.meta.url));

    worker.onerror = (err) => {
      setStatus('error');
      setProgress(`Worker Error: ${err.message}`);
    };

    worker.onmessage = async (e) => {
      const regions = e.data;
      const edges = findEdges(quantizedData, width, height);
      worker.terminate();

      const recordingPromise = recordCanvas(canvasRef.current, (stop) => {
        startAnimation(
          canvasRef.current,
          regions,
          edges,
          palette,
          () => {}, // onFrame
          () => stop() // onComplete
        );
      });
      
      setProgress('Recording animation...');
      const { blob: recordedBlob, mimeType } = await recordingPromise;

      if (mimeType.includes('mp4')) {
        setVideoUrl(URL.createObjectURL(recordedBlob));
        setStatus('done');
        setProgress('');
      } else {
        try {
          setStatus('transcoding');
          setProgress('Starting Transcoding Engine...');
          const ffmpeg = ffmpegRef.current;
          const inputName = 'input.webm';
          const outputName = 'output.mp4';
          
          setProgress('Reading recorded data...');
          await ffmpeg.FS('writeFile', inputName, new Uint8Array(await recordedBlob.arrayBuffer()));
          
          setProgress('Converting to MP4 (H.264)...');
          await ffmpeg.run('-i', inputName, '-c:v', 'libx264', '-preset', 'ultrafast', outputName);
          
          const data = ffmpeg.FS('readFile', outputName);
          const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
          
          setVideoUrl(URL.createObjectURL(mp4Blob));
          setStatus('done');
          setProgress('');
        } catch (err) {
          console.error('Transcoding Error:', err);
          setStatus('error');
          setProgress(`Transcoding Error: ${err.message}. Your browser might not support this feature.`);
        }
      }
    };

    worker.postMessage({ quantizedData, width, height, palette });
  };

  return (
    <div className="app-container">
      <header>
        <h1>Paint-by-Numbers</h1>
        <div style={{ fontSize: '0.8rem', color: ffmpegLoaded ? '#4caf50' : '#f44336' }}>
          FFmpeg: {ffmpegLoaded ? 'Ready' : 'Loading...'} | Isolation: {isolationStatus}
        </div>
      </header>
      <main>
        {status === 'idle' && (
          <div className="upload-section">
            <input type="file" accept="image/*" onChange={handleUpload} />
            <p>Upload a photo to start</p>
          </div>
        )}

        {(status === 'processing' || status === 'generating' || status === 'transcoding') && (
          <div className="loading-spinner">
            <p>{progress || status.charAt(0).toUpperCase() + status.slice(1) + '...'}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="error-box">
            <p>{progress}</p>
            <button className="secondary-button" onClick={() => window.location.reload()}>Retry Page</button>
          </div>
        )}

        <div className="preview-container" style={{ display: (status === 'idle' || status === 'error') ? 'none' : 'block' }}>
          <canvas ref={canvasRef} className="preview-canvas" />
        </div>

        {status === 'ready' && (
          <button className="primary-button" onClick={handleGenerate}>
            Generate Paint-by-Numbers Video
          </button>
        )}

        {status === 'done' && (
          <div className="results">
            <video src={videoUrl} controls autoPlay loop className="result-video" />
            <a href={videoUrl} download="paint-by-numbers.mp4" className="download-link">
              Download MP4
            </a>
            <button className="secondary-button" onClick={() => setStatus('idle')}>
              Start Over
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
