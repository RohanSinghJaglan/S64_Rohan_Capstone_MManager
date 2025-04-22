import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from "markdown-it";
import Base64 from "base64-js";
import { toast } from "react-toastify";

// Move API key to environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('Environment variables:', {
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  API_KEY
});

const SkinDiseaseAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState(
    "Explain the user about the skin disease that they are having and provide immediate measures, long-term prevention, and recommended diet."
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (event) => {
    event.preventDefault();
    if (!image) {
      toast.error("Please upload an image.");
      return;
    }

    if (!API_KEY) {
      toast.error("API key is not configured. Please check your environment variables.");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      // Convert Image to Base64
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(image);
        reader.onload = () => resolve(Base64.fromByteArray(new Uint8Array(reader.result)));
        reader.onerror = reject;
      });
      const mimeType = image.type;
      const contents = [
        {
          role: "user",
          parts: [
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
            {
              text: `${prompt}

              Please format the response in the following structured way:
              🩺 **Diagnosis**: [Skin Disease Name]
              🚑 **Immediate Measures**:
              - Measure 1
              - Measure 2

              🛡 **Long-Term Prevention**:
              - Prevention 1
              - Prevention 2

              🥗 **Recommended Diet**:
              - Food 1
              - Food 2
              `,
            },
          ],
        },
      ];
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });