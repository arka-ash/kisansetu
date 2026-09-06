import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, X, Check, AlertCircle, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  cropName?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  cropName = 'Crop',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');

  // Sample verified farm crop photos for instant test selection
  const SAMPLE_CROP_PHOTOS: { name: string; url: string }[] = [
    { name: 'Fresh Onion Lot', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
    { name: 'Graded Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
    { name: 'Red Ripe Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
    { name: 'Aromatic Paddy Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
    { name: 'Yellow Mustard Seeds', url: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=600&auto=format&fit=crop&q=80' },
    { name: 'Fresh Ginger Rhizomes', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80' },
  ];

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API is not supported on this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.message || 'Camera permission denied or camera device in use. You can easily upload a photo from device storage.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, capturedImage]);

  // Take Snapshot from video
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCapturedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCapturedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-sans">
                Capture / Add Crop Photo
              </h3>
              <p className="text-xs text-slate-400">
                Verified photos increase buyer trust and offer speed for <strong className="text-emerald-400">{cropName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {!capturedImage && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
                activeTab === 'camera'
                  ? 'border-emerald-700 text-emerald-800 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
                activeTab === 'upload'
                  ? 'border-emerald-700 text-emerald-800 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => setActiveTab('samples')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
                activeTab === 'samples'
                  ? 'border-emerald-700 text-emerald-800 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Presets</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Captured Preview */}
          {capturedImage ? (
            <div className="space-y-4 text-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950 aspect-4/3 flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Captured Crop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Photo Ready</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCapturedImage(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake / Choose Another</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Use This Photo</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: LIVE CAMERA */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
                      <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">
                          Live Camera Unavailable
                        </h4>
                        <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto leading-relaxed">
                          {cameraError}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('upload')}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload From Storage</span>
                        </button>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="bg-white border border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                        >
                          Retry Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center border border-slate-800">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />

                        {/* Viewfinder Target Overlay */}
                        <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                          <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                            Align {cropName} within frame
                          </span>
                        </div>

                        {/* Camera Switch button */}
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs transition cursor-pointer border border-white/20"
                          title="Switch Front/Back Camera"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={takeSnapshot}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2 text-sm transform active:scale-95"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Capture Photo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: UPLOAD FILE */}
              {activeTab === 'upload' && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition cursor-pointer space-y-3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Click to Browse or Drag & Drop Crop Image
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP (Max 10 MB)
                    </p>
                  </div>
                  <span className="inline-block bg-white text-emerald-700 border border-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs">
                    Choose Device Photo
                  </span>
                </div>
              )}

              {/* TAB 3: VERIFIED PRESETS */}
              {activeTab === 'samples' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">
                    Select a sample photo representing your crop batch:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SAMPLE_CROP_PHOTOS.map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => setCapturedImage(sample.url)}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-600 transition cursor-pointer text-left aspect-4/3 bg-slate-100"
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[11px] font-semibold text-white truncate drop-shadow">
                            {sample.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
