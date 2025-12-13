'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface EditMessageFormProps {
  initialContent: string;
  initialImages?: string[];
  onSave: (content: string, imageFiles?: File[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditMessageForm: React.FC<EditMessageFormProps> = ({
  initialContent,
  initialImages = [],
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialImages);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setSelectedImages((prev) => [...prev, ...files]);

      // Create preview URLs for new images
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrls((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    },
    []
  );

  const removeImage = useCallback((index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    // Also remove from selected files if it's a new image
    if (index >= initialImages.length) {
      setSelectedImages((prev) =>
        prev.filter((_, i) => i !== index - initialImages.length)
      );
    }
  }, [initialImages.length]);

  const handleSave = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      alert('Please enter a message or select an image');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(content, selectedImages.length > 0 ? selectedImages : undefined);
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Failed to save message. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
      {/* Images Preview */}
      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative h-20 w-20">
              <Image
                src={url}
                alt={`Preview ${index}`}
                fill
                className="rounded object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                type="button"
                disabled={isSaving || isLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Text Input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Edit your message..."
        className="min-h-20 w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        disabled={isSaving || isLoading}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ pointerEvents: isSaving || isLoading ? 'none' : 'auto', opacity: isSaving || isLoading ? 0.5 : 1 }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Image
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isSaving || isLoading}
          />
        </label>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isSaving || isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSaving ? 'Saving...' : 'Save Edit'}
          </button>
        </div>
      </div>
    </div>
  );
};
