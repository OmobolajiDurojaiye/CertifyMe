import React, { useState, useRef, createRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import {
  createCustomTemplate,
  getTemplate,
  updateCustomTemplate,
} from "../api";
import CustomTemplateEditor from "../components/CustomTemplateEditor";
import TextElementControls from "../components/TextElementControls";
import { SERVER_BASE_URL } from "../config";

const PLACEHOLDERS = [
  { name: "Recipient Name", value: "{{recipient_name}}", defaultWidth: 350 },
  { name: "Course Title", value: "{{course_title}}", defaultWidth: 400 },
  { name: "Issue Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Issuer Name", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Verification ID", value: "{{verification_id}}", defaultWidth: 300 },
  { name: "Signature", value: "{{signature}}", defaultWidth: 200 },
  { name: "QR Code", value: "{{qr_code}}", isQr: true },
];

const DraggablePlaceholder = ({ placeholder }) => (
  <div
    draggable
    className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-800 p-2 rounded-md cursor-grab active:cursor-grabbing border"
    onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify(placeholder));
    }}
  >
    {placeholder.name}
  </div>
);

const UploadTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateImageFile, setTemplateImageFile] = useState(null);
  const [templateImageUrl, setTemplateImageUrl] = useState(null);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 842, height: 595 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!templateId);
  const fileInputRef = useRef(null);
  const stageRef = createRef();

  useEffect(() => {
    if (templateId) {
      const fetchTemplateData = async () => {
        try {
          const response = await getTemplate(templateId);
          const { title, layout_data } = response.data;
          setTemplateTitle(title);
          if (layout_data) {
            const loadedElements = layout_data.elements || [];
            setElements(loadedElements);
            setCanvasSize(layout_data.canvas || { width: 842, height: 595 });
            if (layout_data.background?.image) {
              setTemplateImageUrl(
                `${SERVER_BASE_URL}${layout_data.background.image}`
              );
            }
            setHistory([loadedElements]);
            setCurrentStep(0);
          }
        } catch (error) {
          toast.error("Failed to load template data.");
          navigate("/dashboard/templates");
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplateData();
    }
  }, [templateId, navigate]);

  useEffect(() => {
    if (!isLoadingHistory) {
      const newHistory = history.slice(0, currentStep + 1);
      newHistory.push(elements);
      setHistory(newHistory);
      setCurrentStep(newHistory.length - 1);
    } else {
      setIsLoadingHistory(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  const handleUndo = () => {
    if (currentStep > 0) {
      setIsLoadingHistory(true);
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setElements(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      setIsLoadingHistory(true);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setElements(history[nextStep]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          // Standard A4 landscape width
          const canvasWidth = 842;
          const canvasHeight = canvasWidth / aspectRatio;
          setCanvasSize({ width: canvasWidth, height: canvasHeight });
          setTemplateImageUrl(event.target.result);
          setTemplateImageFile(file);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid PNG or JPG image.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const pos = stageRef.current.getPointerPosition();
    const placeholder = JSON.parse(e.dataTransfer.getData("text/plain"));

    const defaultWidth = placeholder.defaultWidth || 250;
    const isQr = placeholder.isQr || false;

    const newElement = {
      // --- THIS IS THE FIX (Part 1) ---
      // Using a more robust random string for the ID instead of Date.now()
      id: `el_${Math.random().toString(36).substring(2, 11)}`,
      // --- END OF FIX ---
      type: "placeholder",
      text: placeholder.value,
      x: pos.x - defaultWidth / 2,
      y: pos.y - 15,
      width: defaultWidth,
      height: 30,
      fontSize: 24,
      fontFamily: "Times New Roman",
      fill: "#000000",
      align: "left",
      fontStyle: "normal",
      rotation: 0,
      verticalAlign: "top",
      isQr,
    };

    if (isQr) {
      newElement.x = pos.x - 50;
      newElement.y = pos.y - 50;
      newElement.width = 100;
      newElement.height = 100;
      newElement.align = "center";
    }

    setElements([...elements, newElement]);
  };

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim())
      return toast.error("Please provide a title for your template.");
    if (!templateImageUrl)
      return toast.error("Please upload or keep a template image.");
    if (elements.length === 0)
      return toast.error("Please add at least one placeholder element.");

    setIsSubmitting(true);
    const layoutData = {
      canvas: canvasSize,
      // --- THIS IS THE FIX (Part 2) ---
      // Ensure the element 'id' is saved along with its other properties
      elements: elements.map((el) => ({
        id: el.id, // <-- CRITICAL FIX: Save the ID
        type: "placeholder",
        text: el.text,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fill: el.fill,
        align: el.align,
        fontStyle: el.fontStyle,
        rotation: el.rotation,
        verticalAlign: el.verticalAlign,
        isQr: el.isQr,
      })),
      // --- END OF FIX ---
    };

    if (templateId && !templateImageFile && templateImageUrl) {
      const relativePath = templateImageUrl.replace(SERVER_BASE_URL, "");
      layoutData.background = { image: relativePath };
    }

    const formData = new FormData();
    formData.append("title", templateTitle);
    formData.append("layout_data", JSON.stringify(layoutData));
    if (templateImageFile) {
      formData.append("template_image", templateImageFile);
    }

    const promise = templateId
      ? updateCustomTemplate(templateId, formData)
      : createCustomTemplate(formData);

    toast.promise(promise, {
      loading: templateId ? "Updating template..." : "Saving template...",
      success: () => {
        setTimeout(() => navigate("/dashboard/templates"), 1500);
        return `Template ${
          templateId ? "updated" : "saved"
        } successfully! Redirecting...`;
      },
      error: (err) =>
        err.response?.data?.msg ||
        `Failed to ${templateId ? "update" : "save"} template.`,
    });
    promise.finally(() => setIsSubmitting(false));
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Toaster position="top-center" />
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/templates")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <input
            type="text"
            value={templateTitle}
            onChange={(e) => setTemplateTitle(e.target.value)}
            placeholder="Enter Template Title..."
            className="text-lg font-semibold border-b-2 border-transparent focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleUndo}
            disabled={currentStep <= 0}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={currentStep >= history.length - 1}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={handleSaveTemplate}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Save size={18} />
            )}
            <span>{isSubmitting ? "Saving..." : "Save Template"}</span>
          </button>
        </div>
      </header>

      <div className="flex-grow grid grid-cols-12 gap-4 p-4">
        <aside className="col-span-3 bg-white rounded-lg shadow p-4 flex flex-col gap-4">
          <h3 className="font-bold text-lg">Controls</h3>
          {isLoading ? (
            <div className="text-center p-6">
              <Spinner />
              <p className="mt-2 text-gray-500">Loading template...</p>
            </div>
          ) : !templateImageUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="text-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <UploadCloud size={48} className="mx-auto text-gray-400" />
              <h4 className="font-semibold mt-2">Upload Your Template</h4>
              <p className="text-sm text-gray-500">
                Click to upload a JPG or PNG file.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">
                  Drag Placeholders onto Canvas
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {PLACEHOLDERS.map((p) => (
                    <DraggablePlaceholder key={p.value} placeholder={p} />
                  ))}
                </div>
              </div>
              {selectedElement ? (
                <TextElementControls
                  element={selectedElement}
                  onUpdate={(updatedAttrs) => {
                    const updatedElements = elements.map((el) =>
                      el.id === selectedId ? { ...el, ...updatedAttrs } : el
                    );
                    setElements(updatedElements);
                  }}
                  onDelete={() => {
                    setElements(elements.filter((el) => el.id !== selectedId));
                    setSelectedId(null);
                  }}
                  onDone={() => setSelectedId(null)}
                />
              ) : (
                <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                  <p>
                    Drag placeholders onto your template. Click a placeholder on
                    the canvas to edit its style.
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>

        <main
          className="col-span-9 bg-gray-200 rounded-lg shadow-inner flex items-center justify-center overflow-auto p-4"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {templateImageUrl ? (
            <CustomTemplateEditor
              stageRef={stageRef}
              backgroundImageUrl={templateImageUrl}
              elements={elements}
              setElements={setElements}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              canvasSize={canvasSize}
            />
          ) : (
            <div className="text-gray-500">
              {isLoading ? " " : "Please upload a template image to begin."}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UploadTemplatePage;
