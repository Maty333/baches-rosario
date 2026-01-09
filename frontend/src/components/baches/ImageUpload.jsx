import { useState } from "react";
import "./ImageUpload.css";

const ImageUpload = ({ images, onChange, maxImages = 5 }) => {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;

    if (files.length > remainingSlots) {
      alert(`Solo puedes subir ${remainingSlots} imagen(es) más`);
      return;
    }

    const newImages = files.slice(0, remainingSlots);
    onChange([...images, ...newImages]);

    // Crear previews
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
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
            : `Subir imágenes (${images.length}/${maxImages})`}
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

