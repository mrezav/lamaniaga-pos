"use client";

import { useEffect, useRef, useState } from "react";

interface UseSpeechToTextOptions {
    lang?: string;
    onResult: (text: string, isFinal: boolean) => void;
    silenceDelay?: number;
}

export function useSpeechToText({
    lang = "id-ID",
    onResult,
    silenceDelay = 1000,
}: UseSpeechToTextOptions) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false); // Default sudah false

    const recognitionRef = useRef<any>(null);
    const onResultRef = useRef(onResult);
    const silenceTimeoutRef = useRef<any>(null);
    const isListeningRef = useRef(isListening);

    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const WindowWithSpeech = window as unknown as {
            SpeechRecognition?: any;
            webkitSpeechRecognition?: any;
        };

        const SpeechRecognitionConstructor =
            WindowWithSpeech.SpeechRecognition ||
            WindowWithSpeech.webkitSpeechRecognition;

        // 1. Jika tidak disupport, langsung return (biarkan state tetap false bawaan)
        if (!SpeechRecognitionConstructor) {
            return;
        }

        // 2. Gunakan queueMicrotask agar tidak memicu cascading renders secara sinkron
        queueMicrotask(() => {
            setIsSupported(true);
        });

        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onresult = (event: any) => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                onResultRef.current(finalTranscript, true);
            } else if (interimTranscript) {
                onResultRef.current(interimTranscript, false);
            }

            silenceTimeoutRef.current = setTimeout(() => {
                if (recognitionRef.current && isListeningRef.current) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                }
            }, silenceDelay);
        };

        recognition.onerror = (event: any) => {
            // console.error("Speech recognition error:", event.error);
            if (event.error !== "aborted") {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            if (silenceTimeoutRef.current)
                clearTimeout(silenceTimeoutRef.current);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
        };
    }, [lang, silenceDelay]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                if (silenceTimeoutRef.current)
                    clearTimeout(silenceTimeoutRef.current);
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error("Gagal menjalankan Speech Recognition:", error);
            }
        }
    };

    const stopListening = () => {
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return {
        isListening,
        isSupported,
        startListening,
        stopListening,
    };
}
