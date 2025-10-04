// File: src/pages/VisualEditorPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Rect,
  Transformer,
} from "react-konva";
import { Button, Form, Modal, Spinner, Alert, Dropdown } from "react-bootstrap";
import {
  Plus,
  Save,
  Upload,
  Image as ImageIcon,
  Type,
  Square,
  RotateCcw,
  Trash2,
  Edit3,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
} from "lucide-react";
import {
  getVisualTemplate,
  createVisualTemplate,
  updateVisualTemplate,
  uploadEditorImage,
} from "../api";
import { SERVER_BASE_URL } from "../config";
import toast from "react-hot-toast";

const VisualEditorPage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const stageRef = useRef();
  const trRef = useRef();
  const [template, setTemplate] = useState({
    id: null,
    title: "New Custom Template",
    layoutData: {
      canvas: { width: 842, height: 595 }, // A4 landscape in points
      background: { url: null },
      elements: [],
    },
  });
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState("select");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  useEffect(() => {
    if (stageRef.current && selectedId) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else {
      trRef.current.nodes([]);
    }
  }, [selectedId]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const response = await getVisualTemplate(templateId);
      const data = response.data;
      setTemplate({
        id: data.id,
        title: data.title,
        layoutData: data.layout_data,
      });
      if (data.layout_data.background.url) {
        loadBackgroundImage(data.layout_data.background.url);
      }
    } catch (error) {
      toast.error("Failed to load template");
      console.error(error);
    }
    setLoading(false);
  };

  const loadBackgroundImage = (url) => {
    const img = new window.Image();
    img.onload = () => {
      setBackgroundImage(img);
    };
    img.src = `${SERVER_BASE_URL}${url}`;
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      setSelectedElementIndex(null);
    } else if (e.target.id()) {
      setSelectedId(e.target.id());
      const index = template.layoutData.elements.findIndex(
        (el) => el.id === e.target.id()
      );
      setSelectedElementIndex(index);
    }
  };

  const handleDragEnd = (index, e) => {
    updateElement(index, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = (index, e) => {
    const node = stageRef.current.findOne(
      `#${template.layoutData.elements[index].id}`
    );
    updateElement(index, {
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      rotation: node.rotation(),
      scaleX: 1,
      scaleY: 1,
    });
  };

  const updateElement = (index, updates) => {
    setTemplate((prev) => {
      const newElements = [...prev.layoutData.elements];
      newElements[index] = { ...newElements[index], ...updates };
      return {
        ...prev,
        layoutData: {
          ...prev.layoutData,
          elements: newElements,
        },
      };
    });
  };

  const addElement = (type) => {
    const newIndex = template.layoutData.elements.length;
    let newElement = {
      id: `element_${newIndex}_${Date.now()}`,
      type,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      width: 200,
      height: 50,
      rotation: 0,
      fontSize: 24,
      fill: "#000000",
      align: "center",
      fontStyle: "",
      fontFamily: "Arial",
      strokeWidth: 1,
      stroke: "#000000",
    };

    if (type === "text") {
      newElement.text = "{{recipient_name}}"; // Default placeholder
      newElement.height = 60;
    } else if (type === "image") {
      newElement.width = 150;
      newElement.height = 100;
      newElement.src = null;
    } else if (type === "shape") {
      newElement.width = 100;
      newElement.height = 100;
      newElement.fill = "transparent";
    } else if (type === "qr") {
      newElement.width = 100;
      newElement.height = 100;
      newElement.fill = "#000"; // Placeholder for QR
    }

    setTemplate((prev) => ({
      ...prev,
      layoutData: {
        ...prev.layoutData,
        elements: [...prev.layoutData.elements, newElement],
      },
    }));

    setSelectedId(newElement.id);
    setSelectedElementIndex(newIndex);
    setTool("select");
  };

  const deleteSelectedElement = () => {
    if (selectedElementIndex !== null) {
      setTemplate((prev) => ({
        ...prev,
        layoutData: {
          ...prev.layoutData,
          elements: prev.layoutData.elements.filter(
            (_, i) => i !== selectedElementIndex
          ),
        },
      }));
      setSelectedId(null);
      setSelectedElementIndex(null);
    }
  };

  const uploadBackground = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await uploadEditorImage(formData);
      const url = response.data.url;
      loadBackgroundImage(url);

      setTemplate((prev) => ({
        ...prev,
        layoutData: {
          ...prev.layoutData,
          background: { ...prev.layoutData.background, url },
        },
      }));
      toast.success("Background uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload background");
      console.error(error);
    }
  };

  const uploadElementImage = async (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await uploadEditorImage(formData);
        const url = response.data.url;
        updateElement(index, { src: url });

        // Load image for preview
        const img = new window.Image();
        img.onload = () => {
          const element = template.layoutData.elements[index];
          if (element.id) {
            const konvaImg = stageRef.current.findOne(`#${element.id}`);
            if (konvaImg) {
              konvaImg.image(img);
              stageRef.current.batchDraw();
            }
          }
        };
        img.src = `${SERVER_BASE_URL}${url}`;
        toast.success("Image uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload image");
        console.error(error);
      }
    };
    input.click();
  };

  const availablePlaceholders = [
    "{{recipient_name}}",
    "{{recipient_email}}",
    "{{course_title}}",
    "{{issuer_name}}",
    "{{issue_date}}",
    "{{signature}}",
    "{{verification_id}}",
    "{{qr_code}}",
  ];

  const handleTextChange = (index, newText) => {
    updateElement(index, { text: newText });
  };

  const renderElement = (el, index) => {
    const commonProps = {
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation || 0,
      draggable: true,
      onDragEnd: (e) => handleDragEnd(index, e),
      onTransformEnd: (e) => handleTransformEnd(index, e),
      scaleX: el.scaleX || 1,
      scaleY: el.scaleY || 1,
    };

    if (el.type === "text") {
      return (
        <Text
          {...commonProps}
          text={el.text || ""}
          fontSize={el.fontSize}
          fill={el.fill}
          align={el.align}
          fontFamily={el.fontFamily}
          fontStyle={el.fontStyle.includes("bold") ? "bold" : "normal"}
          fontWeight={el.fontStyle.includes("bold") ? "bold" : "normal"}
          wrap="word"
          onDblClick={() => {
            const text = prompt("Enter text or placeholder:", el.text);
            if (text !== null) {
              handleTextChange(index, text);
            }
          }}
        />
      );
    } else if (el.type === "image") {
      return (
        <KonvaImage
          {...commonProps}
          image={el.image}
          onDblClick={() => uploadElementImage(index)}
        />
      );
    } else if (el.type === "shape") {
      return (
        <Rect
          {...commonProps}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth || 1}
          cornerRadius={el.cornerRadius || 0}
        />
      );
    } else if (el.type === "qr") {
      return (
        <Rect
          {...commonProps}
          fill="#000"
          stroke="#fff"
          strokeWidth={2}
          onDblClick={() => {
            // Placeholder for QR, can add logic to generate real QR later
          }}
        />
      );
    }
    return null;
  };

  const saveTemplate = async () => {
    const payload = {
      title: template.title,
      layout_data: template.layoutData,
    };
    try {
      let response;
      if (template.id) {
        response = await updateVisualTemplate(template.id, payload);
      } else {
        response = await createVisualTemplate(payload);
        toast.success(
          "Custom template created! You can now use it to generate certificates with your uploaded design and placeholders."
        );
        navigate("/dashboard/templates");
        return;
      }
      toast.success("Template saved successfully!");
    } catch (error) {
      toast.error("Failed to save template");
      console.error(error);
    }
    setShowSaveModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner animation="border" size="lg" />
      </div>
    );
  }

  const { canvas, elements } = template.layoutData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Custom Template Editor
            </h1>
            <p className="text-gray-600 mt-1">
              Upload your template image and add placeholders like{" "}
              {{ recipient_name }}, {{ course_title }}, etc. The app will
              automatically fill them when generating certificates.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/dashboard/templates")}
            >
              Back to Templates
            </Button>
            <Button variant="primary" onClick={() => setShowSaveModal(true)}>
              <Save className="me-2 h-4 w-4" />
              Save Template
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Dropdown>
              <Dropdown.Toggle
                variant={tool === "select" ? "primary" : "outline-primary"}
                id="tool-dropdown"
              >
                {tool === "select" ? "Select" : "Add Element"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => addElement("text")}>
                  <Type className="me-2 h-4 w-4" /> Text Placeholder
                </Dropdown.Item>
                <Dropdown.Item onClick={() => addElement("image")}>
                  <ImageIcon className="me-2 h-4 w-4" /> Image
                </Dropdown.Item>
                <Dropdown.Item onClick={() => addElement("shape")}>
                  <Square className="me-2 h-4 w-4" /> Shape
                </Dropdown.Item>
                <Dropdown.Item onClick={() => addElement("qr")}>
                  QR Code Placeholder
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Background
              <input
                type="file"
                onChange={uploadBackground}
                className="hidden"
                accept="image/*"
              />
            </label>
            {selectedElementIndex !== null && (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={deleteSelectedElement}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowPropertiesModal(true)}
                >
                  <Edit3 className="h-4 w-4" />
                  Properties
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Tip: Double-click text to edit placeholder (e.g.,{" "}
              {{ recipient_name }})
            </span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-center">
          <div className="relative">
            <Stage
              width={canvas.width}
              height={canvas.height}
              onClick={handleStageClick}
              ref={stageRef}
              draggable={false}
              className="border-2 border-gray-300 rounded"
            >
              <Layer>
                {backgroundImage && (
                  <KonvaImage
                    image={backgroundImage}
                    width={canvas.width}
                    height={canvas.height}
                  />
                )}
                {elements.map((el, index) => renderElement(el, index))}
                <Transformer
                  ref={trRef}
                  rotateEnabled={true}
                  borderStroke="#0099ff"
                  anchorStroke="#0099ff"
                  borderStrokeWidth={1}
                  anchorSize={10}
                  anchorFill="#0099ff"
                />
              </Layer>
            </Stage>
            <div className="absolute -top-10 left-0 text-xs text-gray-500">
              Canvas: {canvas.width} x {canvas.height} px (A4 Landscape)
            </div>
          </div>
        </div>

        {/* Elements Panel */}
        {elements.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              Elements ({elements.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {elements.map((el, index) => (
                <div
                  key={el.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedElementIndex === index
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedId(el.id);
                    setSelectedElementIndex(index);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {el.type === "text"
                        ? el.text || "Text"
                        : el.type.charAt(0).toUpperCase() + el.type.slice(1)}
                    </span>
                    {selectedElementIndex === index && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Pos: ({Math.round(el.x)}, {Math.round(el.y)}) Size:{" "}
                    {Math.round(el.width)}x{Math.round(el.height)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties Modal */}
        <Modal
          show={showPropertiesModal}
          onHide={() => setShowPropertiesModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Element Properties</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedElementIndex !== null && (
              <Form>
                {template.layoutData.elements[selectedElementIndex].type ===
                  "text" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Placeholder/Text</Form.Label>
                      <Form.Select
                        value={
                          template.layoutData.elements[selectedElementIndex]
                            .text
                        }
                        onChange={(e) =>
                          handleTextChange(selectedElementIndex, e.target.value)
                        }
                      >
                        {availablePlaceholders.map((ph) => (
                          <option key={ph} value={ph}>
                            {ph}
                          </option>
                        ))}
                        <option value="custom">Custom Text...</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Font Size</Form.Label>
                      <Form.Control
                        type="number"
                        value={
                          template.layoutData.elements[selectedElementIndex]
                            .fontSize
                        }
                        onChange={(e) =>
                          updateElement(selectedElementIndex, {
                            fontSize: parseInt(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <div className="d-flex gap-2 mb-3">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          updateElement(selectedElementIndex, {
                            fontStyle: template.layoutData.elements[
                              selectedElementIndex
                            ].fontStyle.includes("bold")
                              ? template.layoutData.elements[
                                  selectedElementIndex
                                ].fontStyle.replace("bold", "")
                              : `${template.layoutData.elements[selectedElementIndex].fontStyle} bold`,
                          })
                        }
                      >
                        <Bold size={14} />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          updateElement(selectedElementIndex, {
                            fontStyle: template.layoutData.elements[
                              selectedElementIndex
                            ].fontStyle.includes("italic")
                              ? template.layoutData.elements[
                                  selectedElementIndex
                                ].fontStyle.replace("italic", "")
                              : `${template.layoutData.elements[selectedElementIndex].fontStyle} italic`,
                          })
                        }
                      >
                        <Italic size={14} />
                      </Button>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label>Alignment</Form.Label>
                      <div className="d-flex gap-2">
                        <Button
                          variant={
                            template.layoutData.elements[selectedElementIndex]
                              .align === "left"
                              ? "primary"
                              : "outline-primary"
                          }
                          size="sm"
                          onClick={() =>
                            updateElement(selectedElementIndex, {
                              align: "left",
                            })
                          }
                        >
                          <AlignLeft size={14} />
                        </Button>
                        <Button
                          variant={
                            template.layoutData.elements[selectedElementIndex]
                              .align === "center"
                              ? "primary"
                              : "outline-primary"
                          }
                          size="sm"
                          onClick={() =>
                            updateElement(selectedElementIndex, {
                              align: "center",
                            })
                          }
                        >
                          <AlignCenter size={14} />
                        </Button>
                        <Button
                          variant={
                            template.layoutData.elements[selectedElementIndex]
                              .align === "right"
                              ? "primary"
                              : "outline-primary"
                          }
                          size="sm"
                          onClick={() =>
                            updateElement(selectedElementIndex, {
                              align: "right",
                            })
                          }
                        >
                          <AlignRight size={14} />
                        </Button>
                      </div>
                    </Form.Group>
                  </>
                )}
                {/* Add more properties for other types as needed */}
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPropertiesModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Save Confirmation Modal */}
        <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Save Custom Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              This template will allow you to generate certificates with your
              uploaded design and dynamic placeholders like recipient_name,
              course_title, etc.
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <Form.Control
                type="text"
                value={template.title}
                onChange={(e) =>
                  setTemplate((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Company Custom Certificate"
              />
            </Form.Group>
            <Alert variant="info">
              <strong>Placeholders supported:</strong>{" "}
              {availablePlaceholders.join(", ")}
              <br />
              {/* <strong>extra_fields:</strong> Access via {{extra_fields.key}} in custom text elements. */}
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveTemplate}>
              Save Template
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default VisualEditorPage;
