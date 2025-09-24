// components/visual_editor/ImagesPanel.jsx
import React, { useRef } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import useEditorStore from "../../store/editorStore";
import { uploadEditorImage } from "../../api";

const ImagesPanel = () => {
  const { elements, addElement } = useEditorStore();
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadEditorImage(formData);
      const url = res.data.url;
      const img = new Image();
      img.src = url;
      img.onload = () => {
        addElement("image", {
          src: url,
          width: img.width / 2,
          height: img.height / 2,
        });
      };
    } catch (err) {
      toast.error("Failed to upload image.");
    }
  };

  const usedImages = [
    ...new Set(
      elements.filter((el) => el.type === "image" && el.src).map((el) => el.src)
    ),
  ];

  const addUsedImage = (src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      addElement("image", {
        src,
        width: img.width / 2,
        height: img.height / 2,
      });
    };
  };

  return (
    <>
      <Button
        variant="primary"
        className="w-100 mb-3"
        onClick={() => fileInputRef.current.click()}
      >
        Upload Image
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={handleUpload}
      />
      <h6>All Used</h6>
      <div className="asset-grid">
        {usedImages.map((src, index) => (
          <div
            key={index}
            className="asset-item"
            onClick={() => addUsedImage(src)}
          >
            <img
              src={src}
              alt="used"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ImagesPanel;
