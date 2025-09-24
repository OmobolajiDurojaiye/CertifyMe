import React from "react";
import { Button } from "react-bootstrap";
import useEditorStore from "../../store/editorStore";

const placeholders = [
  { category: "Recipient", name: "recipient_name" },
  { category: "Credential", name: "course_title" },
  { category: "Credential", name: "issue_date" },
  { category: "Credential", name: "verification_id" },
  { category: "Issuer", name: "issuer_name" },
  { category: "Issuer", name: "signature" },
];

const DynamicAttributesPanel = () => {
  const { addElement, elements } = useEditorStore();

  const isInUse = (name) =>
    elements.some(
      (el) =>
        (el.type === "text" || el.type === "placeholder") &&
        el.text.includes(`{{${name}}}`)
    );

  const grouped = placeholders.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h6>{category}</h6>
          {items.map((p) => (
            <div
              key={p.name}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span>{"{{" + p.name + "}}"}</span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={isInUse(p.name)}
                onClick={() =>
                  addElement("placeholder", {
                    text: `{{${p.name}}}`,
                  })
                }
              >
                {isInUse(p.name) ? "In Use" : "Use"}
              </Button>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default DynamicAttributesPanel;
