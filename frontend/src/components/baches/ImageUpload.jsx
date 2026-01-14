import { useState, useEffect } from "react";
import "../../styles/ImageUpload.css";

const ImageUpload = ({ images, onChange, maxImages = 5, minImages = 0 }) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const newPreviews = [];
    images.forEach((file) => {
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({ file, preview: reader.result });
          if (newPreviews.length === images.length) {
            setPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    if (images.length === 0) {
      setPreviews([]);
    }
  }, [images]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;

    if (files.length > remainingSlots) {
      alert(`Solo puedes subir ${remainingSlots} imagen(es) más`);
      return;
    }

    const newImages = files.slice(0, remainingSlots);
    onChange([...images, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="image-upload">
      <label className="image-upload-label">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={images.length >= maxImages}
        />
        <span className="image-upload-button">
          {images.length >= maxImages
            ? `Máximo ${maxImages} imágenes`
            : `Subir imágenes (${images.length}/${maxImages}${minImages > 0 ? `, mínimo ${minImages}` : ""})`}
        </span>
      </label>

      {previews.length > 0 && (
        <div className="image-upload-previews">
          {previews.map((preview, index) => (
            <div key={index} className="image-upload-preview">
              <img src={preview.preview} alt={`Preview ${index}`} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="image-upload-remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

