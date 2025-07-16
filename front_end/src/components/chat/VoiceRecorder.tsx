// src/components/chat/VoiceRecorder.tsx

import React, { useEffect, useState, useRef } from "react";

/**
 * Props:
 * - onSend: Function to handle the audio blob after recording completes.
 */
interface Props {
  onSend: (audioBlob: Blob) => void;
}

/**
 * ✅ VoiceRecorder Component:
 * - Uses browser MediaRecorder API to record audio from user's microphone.
 * - On stop, sends audio blob to parent via onSend().
 */
const VoiceRecorder: React.FC<Props> = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);         // Is recording in progress?
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);  // MediaRecorder instance
  const audioChunks = useRef<Blob[]>([]);                         // Holds recorded audio data

  /**
   * 🎤 Starts recording when isRecording becomes true:
   * - Requests microphone access.
   * - Initializes MediaRecorder.
   * - Collects audio chunks as data arrives.
   * - On stop, creates Blob and calls onSend().
   */
  useEffect(() => {
    if (!isRecording) return;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const newRecorder = new MediaRecorder(stream);
        audioChunks.current = [];

        // Collect audio chunks as they arrive:
        newRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunks.current.push(e.data);
          }
        };

        // When recording stops:
        newRecorder.onstop = () => {
          const blob = new Blob(audioChunks.current, { type: "audio/webm" });
          onSend(blob);                                           // Send audio to parent
          stream.getTracks().forEach(track => track.stop());       // Stop microphone
        };

        newRecorder.start();
        setRecorder(newRecorder);
      })
      .catch((err) => {
        console.error("Microphone access denied", err);
        setIsRecording(false);                                    // Auto-disable if denied
      });

    // Cleanup: ensure recorder stops on unmount
    return () => {
      recorder?.stop();
    };

  }, [isRecording]);

  /**
   * Stops recording manually.
   */
  const handleStop = () => {
    setIsRecording(false);
    recorder?.stop();
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Toggle Recording Button */}
      <button
        onClick={() => (isRecording ? handleStop() : setIsRecording(true))}
        className={`px-3 py-2 text-sm rounded ${
          isRecording ? "bg-red-600 text-white" : "bg-blue-600 text-white"
        }`}
      >
        {isRecording ? "Stop Recording" : "Record Voice"}
      </button>
    </div>
  );
};

export default VoiceRecorder;
