"use client";

import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { capitalizeText, parseIndonesianNumber } from "@/utils/transform";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";

interface VoiceMicButtonProps {
    fieldName: string;
    fieldType: "text" | "number";
    setValue: any; // Menerima setValue dari useForm parent/child murni
    storeSlug: string;
}

export function VoiceMicButton({
    fieldName,
    fieldType,
    setValue,
    storeSlug,
}: VoiceMicButtonProps) {
    const [interimText, setInterimText] = useState("");

    // 1. Bungkus logika hasil ke dalam useCallback agar referensinya STABIL saat re-render
    const handleSpeechResult = useCallback(
        (text: string, isFinal: boolean) => {
            if (isFinal) {
                setInterimText(""); // Bersihkan teks penunjuk

                if (fieldType === "number") {
                    const numericValue = parseIndonesianNumber(text);
                    setValue(fieldName, numericValue, {
                        shouldValidate: true,
                        shouldDirty: true,
                    });
                } else {
                    const cleanText = capitalizeText(text);
                    setValue(fieldName, cleanText, {
                        shouldValidate: true,
                        shouldDirty: true,
                    });
                }
            } else {
                // Mengupdate state ini memicu re-render, tapi handleSpeechResult tidak akan dibuat ulang
                setInterimText(text);
            }
        },
        [fieldName, fieldType, setValue],
    ); // Dependency list yang aman

    // 2. Oper fungsi yang sudah stabil ke dalam hook perekam suara
    const { isListening, isSupported, startListening, stopListening } =
        useSpeechToText({
            lang: "id-ID",
            onResult: handleSpeechResult,
        });

    if (!isSupported) return null;

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="relative flex items-center">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full transition-all duration-200 ${
                    isListening
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20 animate-pulse"
                        : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={handleToggle}
            >
                {isListening ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Mic className="h-4 w-4" />
                )}
            </Button>

            {isListening && interimText && (
                <div className="absolute bottom-full mb-2 right-0 z-50 max-w-[200px] rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md border">
                    <p className="italic truncate">{interimText}</p>
                </div>
            )}
        </div>
    );
}
