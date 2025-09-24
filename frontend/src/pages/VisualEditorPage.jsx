// VisualEditorPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Spinner, Button, Form } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Undo,
  Redo,
  Trash2,
  Copy,
  Clipboard,
  CopyPlus,
} from "lucide-react";
import useEditorStore from "../store/editorStore";
import {
  getVisualTemplate,
  createVisualTemplate,
  updateVisualTemplate,
} from "../api";
import Canvas from "../components/visual_editor/Canvas";
import LeftToolbar from "../components/visual_editor/LeftToolbar";
import ElementsPanel from "../components/visual_editor/ElementsPanel";
import TextPanel from "../components/visual_editor/TextPanel";
import ImagesPanel from "../components/visual_editor/ImagesPanel";
import DynamicAttributesPanel from "../components/visual_editor/DynamicAttributesPanel";
import ContextualTopBar from "../components/visual_editor/ContextualTopBar";
import "../styles/VisualEditor.css";

const VisualEditorPage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!templateId);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const {
    loadTemplate,
    templateTitle,
    setTemplateTitle,
    elements,
    background,
    canvas,
    undo,
    redo,
    deleteSelected,
    copySelection,
    pasteFromClipboard,
    duplicateSelection,
    historyIndex,
    history,
    selectedIds,
    getFlattenedElements,
  } = useEditorStore();

  useEffect(() => {
    if (templateId) {
      setLoading(true);
      getVisualTemplate(templateId)
        .then((res) => loadTemplate(res.data))
        .catch(() => {
          toast.error("Could not load template.");
          navigate("/dashboard/templates");
        })
        .finally(() => setLoading(false));
    }
    return () => loadTemplate({ title: "Untitled Template" });
  }, [templateId, loadTemplate, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        copySelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        pasteFromClipboard();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        duplicateSelection();
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        ((e.shiftKey && e.key === "z") || e.key === "y")
      ) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          document.activeElement.tagName.toLowerCase() !== "input" &&
          document.activeElement.tagName.toLowerCase() !== "textarea"
        ) {
          deleteSelected();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    copySelection,
    pasteFromClipboard,
    duplicateSelection,
    undo,
    redo,
    deleteSelected,
  ]);

  const handleSave = async () => {
    setSaving(true);
    const flattenedElements = getFlattenedElements();
    const layout_data = { elements: flattenedElements, background, canvas };
    const payload = { title: templateTitle, layout_data };
    const promise = templateId
      ? updateVisualTemplate(templateId, payload)
      : createVisualTemplate(payload);

    toast
      .promise(promise, {
        loading: "Saving...",
        success: (res) => {
          if (!templateId) {
            navigate(`/dashboard/editor/${res.data.template_id}`, {
              replace: true,
            });
          }
          return "Template saved!";
        },
        error: "Failed to save.",
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="editor-layout">
      <Toaster position="top-center" />
      <header className="editor-header d-flex justify-content-between align-items-center p-2">
        <div className="d-flex align-items-center">
          <Link to="/dashboard/templates" className="btn btn-light me-2">
            <ArrowLeft />
          </Link>
          <Form.Control
            type="text"
            value={templateTitle}
            onChange={(e) => setTemplateTitle(e.target.value)}
            className="fw-bold"
          />
        </div>
        <div className="d-flex align-items-center">
          <Button
            variant="light"
            onClick={copySelection}
            disabled={selectedIds.length === 0}
            className="me-1"
          >
            <Copy size={18} />
          </Button>
          <Button variant="light" onClick={pasteFromClipboard} className="me-1">
            <Clipboard size={18} />
          </Button>
          <Button
            variant="light"
            onClick={duplicateSelection}
            disabled={selectedIds.length === 0}
            className="me-1"
          >
            <CopyPlus size={18} />
          </Button>
          <Button
            variant="light"
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            className="me-2"
          >
            <Trash2 size={18} />
          </Button>
          <Button
            variant="light"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="me-1"
          >
            <Undo size={18} />
          </Button>
          <Button
            variant="light"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="me-3"
          >
            <Redo size={18} />
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Spinner size="sm" className="me-1" />
            ) : (
              <Save size={18} className="me-1" />
            )}
            {templateId ? "Save" : "Save Template"}
          </Button>
        </div>
      </header>

      <ContextualTopBar />

      <LeftToolbar activePanel={activePanel} setActivePanel={setActivePanel} />

      <div className="asset-panel">
        {activePanel === "elements" && <ElementsPanel />}
        {activePanel === "images" && <ImagesPanel />}
        {activePanel === "text" && <TextPanel />}
        {activePanel === "attributes" && <DynamicAttributesPanel />}
      </div>

      <main className="canvas-area">
        <Canvas />
      </main>
    </div>
  );
};

export default VisualEditorPage;
