// components/visual_editor/TextPanel.jsx
import React from "react";
import { Button } from "react-bootstrap";
import useEditorStore from "../../store/editorStore";

const TextPanel = () => {
  const { addElement, addCombination } = useEditorStore();

  return (
    <>
      <h6>Text</h6>
      <Button
        variant="outline-primary"
        className="w-100 mb-2"
        onClick={() =>
          addElement("text", {
            text: "Heading",
            fontSize: 48,
            fontFamily: "Arial",
            fill: "#000000",
          })
        }
      >
        Add Heading
      </Button>
      <Button
        variant="outline-primary"
        className="w-100 mb-2"
        onClick={() =>
          addElement("text", {
            text: "Subheading",
            fontSize: 32,
            fontFamily: "Arial",
            fill: "#000000",
          })
        }
      >
        Add Subheading
      </Button>
      <Button
        variant="outline-primary"
        className="w-100 mb-2"
        onClick={() =>
          addElement("text", {
            text: "Body Text",
            fontSize: 16,
            fontFamily: "Arial",
            fill: "#000000",
          })
        }
      >
        Add Body Text
      </Button>
      <h6>Combinations</h6>
      <Button
        variant="outline-primary"
        className="w-100"
        onClick={() => addCombination("signature")}
      >
        Add Signature Block
      </Button>
    </>
  );
};

export default TextPanel;
