import { useState, useRef } from 'react';
import { Camera, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access camera. Please ensure camera permissions are granted.');
      console.error('Camera error:', err);
    }
  }

  function capturePhoto() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  function handleConfirm() {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  }

  function handleRetake() {
    setCapturedImage(null);
    startCamera();
  }

  function handleClose() {
    stopCamera();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full border border-white/20">
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Capture Product Image</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm">
              {error}
            </div>
          )}

          <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex space-x-3">
            {!stream && !capturedImage && (
              <button
                onClick={startCamera}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Camera className="h-5 w-5" />
                <span>Start Camera</span>
              </button>
            )}

            {stream && !capturedImage && (
              <button
                onClick={capturePhoto}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <Camera className="h-5 w-5" />
                <span>Take Photo</span>
              </button>
            )}

            {capturedImage && (
              <>
                <button
                  onClick={handleRetake}
                  className="flex-1 px-6 py-3 bg-gray-200/20 text-white rounded-lg hover:bg-gray-200/30 transition-colors font-semibold"
                >
                  Retake
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Check className="h-5 w-5" />
                  <span>Use This Photo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
