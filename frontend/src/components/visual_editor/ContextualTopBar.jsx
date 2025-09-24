import React, { useRef } from "react";
import { Button, Form } from "react-bootstrap";
import {
  AlignLeft,
  AlignCenter as AlignHorizontalCenter,
  AlignRight,
  AlignStartVertical as AlignStart,
  AlignCenterVertical as AlignVerticalJustifyCenter,
  AlignEndVertical,
  // --- THIS IS THE FINAL FIX FOR ALL ICONS ---
  Columns3 as DistributeHorizontal, // Replaced non-existent icon
  Rows3 as DistributeVertical, // Replaced non-existent icon
  // --- END OF FIX ---
  Bold,
  Italic,
  Underline,
  Lock,
  Unlock,
  RotateCcw,
} from "lucide-react";
import useEditorStore from "../../store/editorStore";
import { uploadEditorImage } from "../../api";

const fontFamilies = [
  "Arial",
  "Times New Roman",
  "Courier",
  "Verdana",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Impact",
  "Dancing Script",
];

const ContextualTopBar = () => {
  const {
    elements,
    selectedIds,
    canvas,
    background,
    setCanvasConfig,
    setBackground,
    updateSelectedElements,
    alignSelection,
    distributeSelection,
    groupSelected,
    ungroupSelected,
    toggleBold,
    toggleItalic,
    toggleUnderline,
  } = useEditorStore();

  const bgUploadRef = useRef(null);
  const replaceImageRef = useRef(null);

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await uploadEditorImage(formData);
      setBackground({ image: res.data.url });
    } catch {}
  };

  const handleReplaceImage = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await uploadEditorImage(formData);
      updateSelectedElements({ src: res.data.url });
    } catch {}
  };

  if (selectedIds.length === 0) {
    return (
      <div className="contextual-top-bar">
        <Form.Label className="me-2 mb-0">Paper Size</Form.Label>
        <Form.Select
          value={canvas.size}
          onChange={(e) => setCanvasConfig({ size: e.target.value })}
          className="me-3"
          style={{ width: "auto" }}
        >
          <option>A4</option>
          <option>US_LETTER</option>
        </Form.Select>
        <Button
          variant="light"
          className={`me-1 ${
            canvas.orientation === "landscape" ? "active" : ""
          }`}
          onClick={() => setCanvasConfig({ orientation: "landscape" })}
        >
          Landscape
        </Button>
        <Button
          variant="light"
          className={`me-3 ${
            canvas.orientation === "portrait" ? "active" : ""
          }`}
          onClick={() => setCanvasConfig({ orientation: "portrait" })}
        >
          Portrait
        </Button>
        <div className="top-bar-divider" />
        <Button
          variant="light"
          onClick={() => bgUploadRef.current.click()}
          className="me-2"
        >
          Add Background Image
        </Button>
        <input type="file" ref={bgUploadRef} hidden onChange={handleBgUpload} />
        {background.image && (
          <Button
            variant="light"
            onClick={() => setBackground({ image: null })}
          >
            Remove Background
          </Button>
        )}
      </div>
    );
  }

  if (selectedIds.length === 1) {
    const selId = selectedIds[0];
    const sel = elements.find((el) => el.id === selId);
    if (!sel) return null;

    if (sel.type === "text" || sel.type === "placeholder") {
      const isBold = sel.fontStyle?.includes("bold");
      const isItalic = sel.fontStyle?.includes("italic");
      const isUnderline = sel.textDecoration === "underline";

      return (
        <div className="contextual-top-bar">
          <Form.Select
            value={sel.fontFamily}
            onChange={(e) =>
              updateSelectedElements({ fontFamily: e.target.value })
            }
            className="me-2"
            style={{ width: "auto" }}
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </Form.Select>
          <Form.Control
            type="number"
            value={sel.fontSize}
            onChange={(e) =>
              updateSelectedElements({ fontSize: parseInt(e.target.value) })
            }
            className="me-3"
            style={{ width: "60px" }}
          />
          <Button
            variant="light"
            className={`me-1 ${isBold ? "active" : ""}`}
            onClick={toggleBold}
          >
            <Bold size={18} />
          </Button>
          <Button
            variant="light"
            className={`me-1 ${isItalic ? "active" : ""}`}
            onClick={toggleItalic}
          >
            <Italic size={18} />
          </Button>
          <Button
            variant="light"
            className={`me-3 ${isUnderline ? "active" : ""}`}
            onClick={toggleUnderline}
          >
            <Underline size={18} />
          </Button>
          <input
            type="color"
            value={sel.fill}
            onChange={(e) => updateSelectedElements({ fill: e.target.value })}
            className="me-3"
            style={{
              width: "30px",
              height: "30px",
              padding: 0,
              border: "none",
            }}
          />
          <Button
            variant="light"
            className={`me-1 ${sel.align === "left" ? "active" : ""}`}
            onClick={() => updateSelectedElements({ align: "left" })}
          >
            <AlignLeft size={18} />
          </Button>
          <Button
            variant="light"
            className={`me-1 ${sel.align === "center" ? "active" : ""}`}
            onClick={() => updateSelectedElements({ align: "center" })}
          >
            <AlignHorizontalCenter size={18} />
          </Button>
          <Button
            variant="light"
            className={`${sel.align === "right" ? "active" : ""}`}
            onClick={() => updateSelectedElements({ align: "right" })}
          >
            <AlignRight size={18} />
          </Button>
        </div>
      );
    }

    if (sel.type === "shape") {
      return (
        <div className="contextual-top-bar">
          <Form.Label className="me-2 mb-0">Fill</Form.Label>
          <input
            type="color"
            value={sel.fill}
            onChange={(e) => updateSelectedElements({ fill: e.target.value })}
            className="me-3"
            style={{
              width: "30px",
              height: "30px",
              padding: 0,
              border: "none",
            }}
          />
          <Form.Label className="me-2 mb-0">Stroke</Form.Label>
          <input
            type="color"
            value={sel.stroke}
            onChange={(e) => updateSelectedElements({ stroke: e.target.value })}
            className="me-3"
            style={{
              width: "30px",
              height: "30px",
              padding: 0,
              border: "none",
            }}
          />
          <Form.Label className="me-2 mb-0">Stroke Width</Form.Label>
          <Form.Control
            type="number"
            value={sel.strokeWidth}
            onChange={(e) =>
              updateSelectedElements({ strokeWidth: parseInt(e.target.value) })
            }
            className="me-3"
            style={{ width: "60px" }}
          />
          {sel.shapeType === "rect" && (
            <>
              <Form.Label className="me-2 mb-0">Corner Radius</Form.Label>
              <Form.Control
                type="number"
                value={sel.cornerRadius}
                onChange={(e) =>
                  updateSelectedElements({
                    cornerRadius: parseInt(e.target.value),
                  })
                }
                style={{ width: "60px" }}
              />
            </>
          )}
        </div>
      );
    }

    if (sel.type === "image") {
      return (
        <div className="contextual-top-bar">
          <Button
            variant="light"
            className="me-2"
            onClick={() => replaceImageRef.current.click()}
          >
            Replace Image
          </Button>
          <input
            type="file"
            ref={replaceImageRef}
            hidden
            onChange={(e) => handleReplaceImage(e, sel.id)}
          />
          <Button
            variant="light"
            onClick={() =>
              updateSelectedElements({ keepAspectRatio: !sel.keepAspectRatio })
            }
          >
            {sel.keepAspectRatio ? <Lock size={18} /> : <Unlock size={18} />}
          </Button>
        </div>
      );
    }

    if (sel.type === "group") {
      return (
        <div className="contextual-top-bar">
          <Button variant="light" onClick={ungroupSelected}>
            Ungroup
          </Button>
        </div>
      );
    }
  }

  if (selectedIds.length > 1) {
    return (
      <div className="contextual-top-bar">
        <Button
          variant="light"
          className="me-1"
          onClick={() => alignSelection("left")}
        >
          <AlignLeft size={18} />
        </Button>
        <Button
          variant="light"
          className="me-1"
          onClick={() => alignSelection("h-center")}
        >
          <AlignHorizontalCenter size={18} />
        </Button>
        <Button
          variant="light"
          className="me-3"
          onClick={() => alignSelection("right")}
        >
          <AlignRight size={18} />
        </Button>
        <Button
          variant="light"
          className="me-1"
          onClick={() => alignSelection("top")}
        >
          <AlignStart size={18} />
        </Button>
        <Button
          variant="light"
          className="me-1"
          onClick={() => alignSelection("v-center")}
        >
          <AlignVerticalJustifyCenter size={18} />
        </Button>
        <Button
          variant="light"
          className="me-3"
          onClick={() => alignSelection("bottom")}
        >
          <AlignEndVertical size={18} />
        </Button>
        <Button
          variant="light"
          className="me-1"
          onClick={() => distributeSelection("horizontal")}
          disabled={selectedIds.length < 3}
        >
          <DistributeHorizontal size={18} />
        </Button>
        <Button
          variant="light"
          className="me-3"
          onClick={() => distributeSelection("vertical")}
          disabled={selectedIds.length < 3}
        >
          <DistributeVertical size={18} />
        </Button>
        <Button variant="light" onClick={groupSelected}>
          Group
        </Button>
      </div>
    );
  }

  return null;
};

export default ContextualTopBar;
