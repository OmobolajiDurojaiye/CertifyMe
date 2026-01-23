# ProofDeck Integration Guide

A complete guide to integrating ProofDeck's certificate issuance API into your Learning Management Systems (LMS), HR platforms, and custom applications.

## Why Integrate?

Stop manually uploading CSVs. Automate your credential issuance by connecting your existing tools directly to ProofDeck.

*   **LMS**: Issue certificates instantly when a student completes a course.
*   **HR Systems**: Award badges automatically after compliance training or employee milestones.
*   **Events**: Send participation certificates as soon as an attendee checks in.

## Prerequisites

1.  **ProofDeck Account**: You need a **Pro** or **Enterprise** plan to access the API.
2.  **API Key**:
    *   Log in to ProofDeck.
    *   Go to **Settings** > **Developer**.
    *   Click **Generate Key**. Copy and save this key safely.
3.  **Template ID**:
    *   Create or duplicate a template in your dashboard.
    *   The ID is the numeric part of the URL when editing a template (e.g., `/edit/15`) or visible in your Certificates list.

---

## API Reference

**Base URL**: `https://api.proofdeck.com` (Replace with your actual instance URL if self-hosted)

### Issue a Certificate

*   **Endpoint**: `/api/v1/certificates`
*   **Method**: `POST`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `X-API-Key`: `YOUR_API_KEY_HERE`

#### Request Body Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `template_id` | Integer | **Yes** | The ID of the template design to use. |
| `recipient_name` | String | **Yes** | Full name of the certificate recipient. |
| `recipient_email` | String | **Yes** | Email address where the certificate will be sent. |
| `course_title` | String | **Yes** | Name of the course or achievement (e.g., "Advanced Python"). |
| `issue_date` | String | **Yes** | Date string (e.g., "2023-11-15"). |
| `issuer_name` | String | No | Override the default issuer name for this certificate. |
| `extra_fields` | Object | No | Key-value pairs for custom dynamic fields on your template. |

#### Example Request (cURL)

```bash
curl -X POST https://api.proofdeck.com/api/v1/certificates \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pd_live_12345sample" \
  -d '{
    "template_id": 5,
    "recipient_name": "Alice Johnson",
    "recipient_email": "alice@example.com",
    "course_title": "Advanced Data Analytics",
    "issue_date": "2023-11-15"
  }'
```

#### Example Response (201 Created)

```json
{
  "msg": "Certificate created and dispatched successfully.",
  "certificate_id": 1024,
  "verification_id": "a1b2c3d4-e5f6-4789-abcd-1234567890ab"
}
```
