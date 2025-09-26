import React, { useState, useEffect } from "react";
import {
  getGroups,
  createGroup,
  getGroupDetails,
  deleteGroup,
  sendGroupBulkEmail,
  downloadGroupBulkPDF,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import {
  Container,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";
import {
  Folder,
  Plus,
  Trash2,
  Send,
  ChevronLeft,
  Mail,
  CheckCircle,
  Download,
} from "lucide-react";

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [viewingGroup, setViewingGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  const fetchGroups = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getGroups(page);
      setGroups(res.data.groups);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.pages);
    } catch (error) {
      toast.error("Could not fetch groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!viewingGroup) {
      fetchGroups(currentPage);
    }
  }, [currentPage, viewingGroup]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      return toast.error("Group name cannot be empty.");
    }
    const promise = createGroup(newGroupName);
    toast.promise(promise, {
      loading: "Creating group...",
      success: (res) => {
        setShowCreateModal(false);
        setNewGroupName("");
        fetchGroups(1);
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to create group.",
    });
  };

  const handleViewGroup = async (group) => {
    setViewingGroup(group);
    setLoadingDetails(true);
    try {
      const res = await getGroupDetails(group.id);
      setGroupDetails(res.data);
    } catch (error) {
      toast.error("Could not fetch group details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName, certCount) => {
    if (
      window.confirm(
        `Are you sure you want to delete the group "${groupName}"? This will delete all ${certCount} certificates inside it. This action cannot be undone.`
      )
    ) {
      const promise = deleteGroup(groupId);
      toast.promise(promise, {
        loading: "Deleting group...",
        success: (res) => {
          setViewingGroup(null);
          setGroupDetails(null);
          fetchGroups(1);
          return res.data.msg;
        },
        error: (err) => err.response?.data?.msg || "Failed to delete group.",
      });
    }
  };

  const handleSendBulkEmail = async (groupId) => {
    const promise = sendGroupBulkEmail(groupId);
    toast.promise(promise, {
      loading: "Sending emails to all unsent recipients in the group...",
      success: (res) => {
        handleViewGroup(viewingGroup);
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to send emails.",
    });
  };

  const handleBulkDownload = () => {
    setIsBulkDownloading(true);
    const promise = downloadGroupBulkPDF(viewingGroup.id);
    toast.promise(promise, {
      loading: "Generating zip file... This may take a moment.",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        const filename = `${viewingGroup.name
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}_certificates.zip`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "Download starting!";
      },
      error: (err) => err.response?.data?.msg || "Failed to download zip file.",
    });
    promise.finally(() => setIsBulkDownloading(false));
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (viewingGroup) {
    return (
      <Container>
        <Toaster position="top-center" />
        <Button
          variant="light"
          onClick={() => setViewingGroup(null)}
          className="mb-4 d-flex align-items-center fw-medium"
        >
          <ChevronLeft size={16} className="me-1" />
          Back to All Groups
        </Button>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-4 bg-white rounded-3 shadow-sm gap-3">
          <div>
            <h2 className="fw-bold mb-1">{viewingGroup.name}</h2>
            <p className="text-muted mb-0">
              {viewingGroup.certificate_count} certificates in this group
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center"
              onClick={handleBulkDownload}
              disabled={isBulkDownloading}
            >
              {isBulkDownloading ? (
                <Spinner size="sm" className="me-2" />
              ) : (
                <Download size={16} className="me-2" />
              )}
              Download All
            </Button>
            <Button
              variant="primary"
              className="d-flex align-items-center"
              onClick={() => handleSendBulkEmail(viewingGroup.id)}
            >
              <Send size={16} className="me-2" />
              Send Unsent
            </Button>
            <Button
              variant="outline-danger"
              className="d-flex align-items-center"
              onClick={() =>
                handleDeleteGroup(
                  viewingGroup.id,
                  viewingGroup.name,
                  viewingGroup.certificate_count
                )
              }
            >
              <Trash2 size={16} className="me-2" />
              Delete Group
            </Button>
          </div>
        </div>

        {loadingDetails ? (
          <div className="text-center p-5">
            <Spinner />
          </div>
        ) : (
          <div className="row g-3">
            {groupDetails?.certificates.length > 0 ? (
              groupDetails.certificates.map((cert) => (
                <div key={cert.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <h5 className="card-title fw-bold">
                        {cert.recipient_name}
                      </h5>
                      <p className="card-subtitle mb-2 text-muted">
                        {cert.recipient_email}
                      </p>
                      <p className="card-text small">{cert.course_title}</p>
                    </div>
                    <div className="card-footer bg-light border-0 d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </small>
                      {cert.sent_at ? (
                        <div className="d-flex align-items-center text-success fw-medium">
                          <CheckCircle size={14} className="me-1" />
                          Sent
                        </div>
                      ) : (
                        <div className="d-flex align-items-center text-secondary fw-medium">
                          <Mail size={14} className="me-1" />
                          Not Sent
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <Alert variant="info">
                  This group has no certificates. You can add certificates to
                  this group using the "Bulk Create" page.
                </Alert>
              </div>
            )}
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Toaster position="top-center" />
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <h2 className="fw-bold mb-0">Certificate Groups</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="d-flex align-items-center justify-content-center"
        >
          <Plus size={20} className="me-2" />
          Create New Group
        </Button>
      </div>

      {groups.length > 0 ? (
        <div className="row g-3">
          {groups.map((group) => (
            <div key={group.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card h-100 text-center shadow-sm border-0"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
                onClick={() => handleViewGroup(group)}
              >
                <div className="card-body d-flex flex-column justify-content-center p-4">
                  <Folder size={48} className="text-primary mx-auto mb-3" />
                  <h5 className="card-title fw-bold">{group.name}</h5>
                  <p className="card-text text-muted">
                    {group.certificate_count} certificates
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert variant="info">
          You haven't created any groups yet. Create a group to organize your
          bulk-created certificates.
        </Alert>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-4 justify-content-center">
          {[...Array(totalPages).keys()].map((num) => (
            <Pagination.Item
              key={num + 1}
              active={num + 1 === currentPage}
              onClick={() => setCurrentPage(num + 1)}
            >
              {num + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create a New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., 2025 CyberSecurity Cohort"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateGroup}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default GroupsPage;
