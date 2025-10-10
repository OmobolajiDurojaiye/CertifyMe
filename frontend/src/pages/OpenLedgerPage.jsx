import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Card,
  Spinner,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import { advancedSearchCertificates } from "../api";
import {
  Search,
  Award,
  Building,
  User,
  BookOpen,
  Sliders,
  X,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/OpenLedger.css";

// Header and Footer components (can be in a separate file if reused)
const LedgerHeader = () => (
  <header className="py-3 border-bottom bg-white">
    <Container>
      <Link to="/" className="navbar-brand fs-4 fw-bold">
        CertifyMe
      </Link>
    </Container>
  </header>
);
const LedgerFooter = () => (
  <footer className="py-4 mt-auto border-top">
    <Container>
      <small>
        &copy; {new Date().getFullYear()} CertifyMe. All rights reserved.
      </small>
    </Container>
  </footer>
);

// --- Reusable Components for this page ---

const CredentialCard = ({ cert }) => {
  const isCompany = cert.issuer_type === "company";
  const IssuerIcon = isCompany ? Building : User;

  return (
    <Col md={6} lg={4} className="mb-4">
      <Link to={`/verify/${cert.verification_id}`} className="credential-card">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-3">
            <IssuerIcon size={16} className="me-2 text-muted" />
            <span className="card-issuer">{cert.issuer_name}</span>
          </div>
          <Card.Title as="h3" className="card-recipient mb-3">
            <User size={24} className="me-2" />
            {cert.recipient_name}
          </Card.Title>
          <Card.Text as="p" className="card-course mb-4">
            <BookOpen size={18} className="me-2" />
            {cert.course_title}
          </Card.Text>
        </Card.Body>
        <Card.Footer className="px-4 py-2 d-flex justify-content-between align-items-center">
          <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
          <span className="fw-bold">Verify &rarr;</span>
        </Card.Footer>
      </Link>
    </Col>
  );
};

const SkeletonCard = () => (
  <Col md={6} lg={4} className="mb-4">
    <div className="skeleton-card h-100">
      <div className="d-flex align-items-center mb-3">
        <div className="skeleton skeleton-text" style={{ width: "50%" }}></div>
      </div>
      <div
        className="skeleton skeleton-text mb-3"
        style={{ height: "1.5rem" }}
      ></div>
      <div
        className="skeleton skeleton-text"
        style={{ width: "80%", height: "1.2rem" }}
      ></div>
      <div className="mt-auto pt-4">
        <div className="skeleton skeleton-text" style={{ width: "40%" }}></div>
      </div>
    </div>
  </Col>
);

const PlaceholderCard = ({ icon: Icon, title, text }) => (
  <div className="placeholder-card rounded-3">
    <Icon size={48} className="text-muted mb-3" />
    <h3 className="fw-bold">{title}</h3>
    <p className="text-muted">{text}</p>
  </div>
);

// --- Main Page Component ---

const OpenLedgerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State for filters
  const [filters, setFilters] = useState({
    recipient: searchParams.get("recipient") || "",
    issuer: searchParams.get("issuer") || "", // Changed from 'company'
    course: searchParams.get("course") || "",
    startDate: searchParams.get("start_date")
      ? new Date(searchParams.get("start_date"))
      : null,
    endDate: searchParams.get("end_date")
      ? new Date(searchParams.get("end_date"))
      : null,
    sort_by: searchParams.get("sort_by") || "issue_date",
    sort_order: searchParams.get("sort_order") || "desc",
  });

  // State for results
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (params) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await advancedSearchCertificates(params);
      setResults(response.data.results);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    if (Object.keys(params).length > 0) {
      performSearch(params);
    } else {
      setLoading(false);
      setHasSearched(false);
    }
  }, [searchParams, performSearch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { page: 1 };
    for (const [key, value] of Object.entries(filters)) {
      if (value instanceof Date) {
        newParams[key.replace("Date", "_date")] = value
          .toISOString()
          .split("T")[0];
      } else if (value) {
        newParams[key] = value;
      }
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      recipient: "",
      issuer: "",
      course: "",
      startDate: null,
      endDate: null,
      sort_by: "issue_date",
      sort_order: "desc",
    });
    setSearchParams({});
    setResults([]);
    setPagination({});
    setHasSearched(false);
  };

  const handlePageChange = (pageNumber) => {
    setSearchParams((prev) => {
      prev.set("page", pageNumber);
      return prev;
    });
  };

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;
    let items = [];
    for (let number = 1; number <= pagination.pages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === pagination.page}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination className="justify-content-center mt-4">{items}</Pagination>
    );
  };

  return (
    <div className="ledger-page-wrapper">
      <LedgerHeader />
      <main className="ledger-main py-5">
        <Container>
          <Row>
            <Col lg={3}>
              <div className="filter-sidebar">
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                  <Sliders size={20} className="me-2" /> Search Filters
                </h5>
                <Form onSubmit={handleSearch}>
                  <Form.Group className="mb-3">
                    <Form.Label>Recipient Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="recipient"
                      value={filters.recipient}
                      onChange={handleFilterChange}
                      placeholder="e.g., Jane Doe"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Issuer (Company or Individual)</Form.Label>
                    <Form.Control
                      type="text"
                      name="issuer"
                      value={filters.issuer}
                      onChange={handleFilterChange}
                      placeholder="e.g., TechCorp or John Smith"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Credential Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="course"
                      value={filters.course}
                      onChange={handleFilterChange}
                      placeholder="e.g., Web Development"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Issue Date Range</Form.Label>
                    <DatePicker
                      selectsRange
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      onChange={handleDateChange}
                      className="form-control date-range-picker"
                      placeholderText="Select a date range"
                      isClearable
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Sort By</Form.Label>
                    <Form.Select
                      name="sort_by"
                      value={filters.sort_by}
                      onChange={handleFilterChange}
                    >
                      <option value="issue_date">Issue Date</option>
                      <option value="recipient_name">Recipient Name</option>
                    </Form.Select>
                    <Form.Select
                      name="sort_order"
                      value={filters.sort_order}
                      onChange={handleFilterChange}
                      className="mt-2"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </Form.Select>
                  </Form.Group>
                  <div className="d-grid gap-2">
                    <Button type="submit" variant="primary">
                      <Search size={16} className="me-2" />
                      Search
                    </Button>
                    <Button variant="outline-secondary" onClick={clearFilters}>
                      <X size={16} className="me-2" />
                      Clear Filters
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
            <Col lg={9}>
              {loading && (
                <Row>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </Row>
              )}
              {!loading &&
                hasSearched &&
                (results.length > 0 ? (
                  <>
                    <p className="text-muted mb-4">
                      Found <strong>{pagination.total}</strong> matching
                      credentials.
                    </p>
                    <Row>
                      {results.map((cert) => (
                        <CredentialCard
                          key={cert.verification_id}
                          cert={cert}
                        />
                      ))}
                    </Row>
                    {renderPagination()}
                  </>
                ) : (
                  <PlaceholderCard
                    icon={Award}
                    title="No Credentials Found"
                    text="Try adjusting your search filters to find what you're looking for."
                  />
                ))}
              {!loading && !hasSearched && (
                <PlaceholderCard
                  icon={Search}
                  title="Credential Ledger"
                  text="Use the filters on the left to begin your search for verifiable credentials."
                />
              )}
            </Col>
          </Row>
        </Container>
      </main>
      <LedgerFooter />
    </div>
  );
};

export default OpenLedgerPage;
