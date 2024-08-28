"use Client";
import React, { useState, useEffect, useRef } from "react";
import { CldImage } from "next-cloudinary";

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormate = keyof typeof socialFormats;

const SocialShare = () => {
  const [imageUplaod, setImageUplaod] = useState<string | null>(null);
  const [selectedFormate, setselectedFormate] = useState<SocialFormate>(
    "Instagram Portrait (4:5)"
  );
  const [isUploaded, setIsUploaded] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isUploaded) {
      setIsTransforming(true);
    }
  }, [selectedFormate, imageUplaod]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploaded(true);
    const formData = new FormData();
    formData.append("file", file);
  };

  return <div>page</div>;
};

export default SocialShare;
