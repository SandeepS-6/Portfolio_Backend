import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Portfolio API",
      version: "1.3.0",
      description:
        "REST API for the public portfolio and CMS. Public GET /api/projects returns lean cards (images for 1-by-1 card rotation). GET /api/projects/{id} returns the full detail payload. Let's Talk booking (POST /api/meeting/bookings) creates a Google Calendar Meet link when GOOGLE_REFRESH_TOKEN is set, emails guest + host, and attaches a .ics invite. CMS mutations require JWT Bearer access tokens. Refresh tokens are HttpOnly cookies under /api/auth.",
    },
    servers: [
      {
        url: env.apiPublicUrl,
        description: env.isProd ? "Production" : "Local",
      },
    ],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Cookie Consent" },
      { name: "Hero" },
      { name: "About" },
      { name: "What I Do" },
      { name: "Uploads" },
      { name: "Skills" },
      { name: "Skills Section" },
      { name: "Projects" },
      { name: "Experience" },
      { name: "Education" },
      { name: "Certificates" },
      { name: "Social Links" },
      { name: "Contact Info" },
      { name: "Footer" },
      { name: "Settings" },
      { name: "Meeting" },
      { name: "Messages" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["ADMIN", "EDITOR"] },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        CookieConsentRequest: {
          type: "object",
          required: ["choice"],
          properties: {
            choice: { type: "string", enum: ["accepted", "rejected"] },
            categories: { type: "object" },
            version: { type: "integer" },
            visitorId: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
          },
        },
        MeetingSettings: {
          type: "object",
          properties: {
            id: { type: "string" },
            hostName: { type: "string" },
            hostInitials: { type: "string", nullable: true },
            hostImageUrl: { type: "string", nullable: true },
            title: { type: "string", example: "30 min meeting" },
            durations: {
              type: "array",
              items: { type: "integer" },
              example: [30, 60],
            },
            locationLabel: { type: "string", example: "Google Meet" },
            meetUrl: {
              type: "string",
              nullable: true,
              description:
                "Fallback Meet room. Unique links per booking use GOOGLE_REFRESH_TOKEN + Calendar API.",
              example: "https://meet.google.com/xxx-xxxx-xxx",
            },
            timezone: { type: "string", example: "Asia/Kolkata" },
            workDays: {
              type: "array",
              items: { type: "integer" },
              description: "0=Sun … 6=Sat",
              example: [1, 2, 3, 4, 5],
            },
            dayStartMinutes: { type: "integer", example: 540 },
            dayEndMinutes: { type: "integer", example: 1200 },
            slotIntervalMin: { type: "integer", example: 30 },
            bufferMinutes: { type: "integer", example: 0 },
            bookingWindowDays: { type: "integer", example: 60 },
            isActive: { type: "boolean" },
            guestEmailSubject: { type: "string", nullable: true },
            guestEmailBody: { type: "string", nullable: true },
            hostEmailSubject: { type: "string", nullable: true },
            hostEmailBody: { type: "string", nullable: true },
          },
        },
        MeetingSlot: {
          type: "object",
          properties: {
            startAt: { type: "string", format: "date-time" },
            endAt: { type: "string", format: "date-time" },
            label: { type: "string", example: "9:00am" },
            label24: { type: "string", example: "09:00" },
            minutes: { type: "integer", example: 540 },
            booked: { type: "boolean" },
          },
        },
        MeetingSlotsResponse: {
          type: "object",
          properties: {
            date: { type: "string", format: "date", example: "2026-08-05" },
            duration: { type: "integer", example: 30 },
            timezone: { type: "string", example: "Asia/Kolkata" },
            slots: {
              type: "array",
              items: { $ref: "#/components/schemas/MeetingSlot" },
            },
          },
        },
        MeetingBookingRequest: {
          type: "object",
          required: ["guestName", "guestEmail", "startAt", "durationMin"],
          properties: {
            guestName: { type: "string", example: "Alex Guest" },
            guestEmail: {
              type: "string",
              format: "email",
              example: "guest@example.com",
            },
            subject: { type: "string" },
            notes: { type: "string", description: "Also accepts body / message" },
            startAt: {
              type: "string",
              format: "date-time",
              description: "ISO UTC from GET /api/meeting/slots",
            },
            durationMin: { type: "integer", enum: [30, 60], example: 30 },
          },
        },
        MeetingBooking: {
          type: "object",
          properties: {
            id: { type: "string" },
            guestName: { type: "string" },
            guestEmail: { type: "string" },
            subject: { type: "string", nullable: true },
            notes: { type: "string", nullable: true },
            startAt: { type: "string", format: "date-time" },
            endAt: { type: "string", format: "date-time" },
            durationMin: { type: "integer" },
            timezone: { type: "string" },
            locationLabel: { type: "string", nullable: true },
            meetUrl: {
              type: "string",
              nullable: true,
              description: "Google Meet join URL for this booking",
              example: "https://meet.google.com/abc-defg-hij",
            },
            status: { type: "string", example: "confirmed" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        MeetingBookingResponse: {
          type: "object",
          properties: {
            booking: { $ref: "#/components/schemas/MeetingBooking" },
            email: {
              type: "object",
              properties: {
                sent: { type: "boolean" },
                guest: { type: "boolean", description: "Guest confirmation emailed" },
                host: { type: "boolean", description: "Host notification emailed" },
                meetUrl: {
                  type: "string",
                  nullable: true,
                  description: "Meet link included in both emails when present",
                },
                reason: { type: "string", description: "Present when SMTP skipped" },
              },
            },
          },
        },
        ProjectImage: {
          type: "object",
          required: ["src"],
          properties: {
            src: {
              type: "string",
              description: "Absolute URL or /uploads/... path",
              example: "/uploads/atlas-1.webp",
            },
            alt: { type: "string", example: "Atlas dashboard overview" },
          },
        },
        ProjectCard: {
          type: "object",
          description:
            "Lean project for the portfolio grid. `images` (up to 3) rotate one-by-one on the card.",
          properties: {
            id: { type: "string", description: "Public slug", example: "project-atlas" },
            dbId: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            shortDescription: { type: "string" },
            image: { $ref: "#/components/schemas/ProjectImage" },
            images: {
              type: "array",
              maxItems: 3,
              items: { $ref: "#/components/schemas/ProjectImage" },
            },
            techStack: { type: "array", items: { type: "object" } },
            features: { type: "array", items: { type: "string" } },
            category: { type: "string" },
            kinds: { type: "array", items: { type: "string" } },
            role: { type: "string" },
            duration: { type: "string" },
            from: { type: "string" },
            to: { type: "string" },
            progress: { type: "number", nullable: true },
            sortDate: { type: "string" },
            githubUrl: { type: "string" },
            liveUrl: { type: "string" },
            caseStudyUrl: { type: "string" },
            docsUrl: { type: "string" },
            featured: { type: "boolean" },
            projectStatus: { type: "string" },
            relatedIds: { type: "array", items: { type: "string" } },
          },
        },
        ProjectsSectionPayload: {
          type: "object",
          description: "Public projects section — lean cards only (no case study / comments).",
          properties: {
            squircle: { type: "object" },
            labels: { type: "object" },
            intro: { type: "object" },
            bottom: { type: "object" },
            kinds: { type: "array", items: { type: "object" } },
            hiddenProjects: { type: "array", items: { type: "object" } },
            projects: {
              type: "array",
              items: { $ref: "#/components/schemas/ProjectCard" },
            },
          },
        },
        ProjectDetailPayload: {
          type: "object",
          description:
            "Public project detail page payload from GET /api/projects/{id}.",
          properties: {
            project: {
              type: "object",
              description: "Full mapped project including gallery, caseStudy, comments",
            },
            prev: { $ref: "#/components/schemas/ProjectCard" },
            next: { $ref: "#/components/schemas/ProjectCard" },
            related: {
              type: "array",
              items: { $ref: "#/components/schemas/ProjectCard" },
            },
            projects: {
              type: "array",
              description: "Switcher entries",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  category: { type: "string" },
                  image: { $ref: "#/components/schemas/ProjectImage" },
                },
              },
            },
            labels: { type: "object" },
            kinds: { type: "array", items: { type: "object" } },
            squircle: { type: "object" },
          },
        },
        ProjectWrite: {
          type: "object",
          description:
            "CMS create/update body. Prefer `gallery` (or alias `images`) as [{ src, alt }]. First image becomes cover when coverImage is omitted.",
          properties: {
            title: { type: "string" },
            slug: { type: "string" },
            summary: { type: "string" },
            description: { type: "string" },
            coverImage: { type: "string" },
            coverAlt: { type: "string" },
            gallery: {
              type: "array",
              items: { $ref: "#/components/schemas/ProjectImage" },
            },
            images: {
              type: "array",
              description: "Alias for gallery",
              items: { $ref: "#/components/schemas/ProjectImage" },
            },
            showcase: { type: "object" },
            caseStudy: { type: "object" },
            techStack: { type: "array", items: { type: "string" } },
            techDetails: { type: "array", items: { type: "object" } },
            isFeatured: { type: "boolean" },
            isVisible: { type: "boolean" },
            displayOrder: { type: "integer" },
          },
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: { 200: { description: "API is up" } },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "CMS login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: { description: "Access token + user; refresh cookie set" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Request password reset email",
          responses: {
            200: { description: "Always OK (does not reveal account existence)" },
          },
        },
      },
      "/api/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset password with emailed token",
          responses: {
            200: { description: "Password updated" },
            400: { description: "Invalid or expired token" },
          },
        },
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Rotate refresh cookie and issue new access token",
          responses: {
            200: { description: "New access token" },
            401: { description: "Invalid/expired refresh token" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Revoke refresh session and clear cookie",
          responses: { 200: { description: "Logged out" } },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Current admin user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "User profile" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/auth/oauth/providers": {
        get: {
          tags: ["Auth"],
          summary: "Which social providers are configured",
          responses: {
            200: {
              description: "{ google: boolean, github: boolean }",
            },
          },
        },
      },
      "/api/auth/oauth/google": {
        get: {
          tags: ["Auth"],
          summary: "Start Google OAuth (browser redirect)",
          responses: { 302: { description: "Redirect to Google" } },
        },
      },
      "/api/auth/oauth/github": {
        get: {
          tags: ["Auth"],
          summary: "Start GitHub OAuth (browser redirect)",
          responses: { 302: { description: "Redirect to GitHub" } },
        },
      },
      "/api/auth/oauth/google/callback": {
        get: {
          tags: ["Auth"],
          summary: "Google OAuth callback",
          responses: { 302: { description: "Redirect to CMS with tokens" } },
        },
      },
      "/api/auth/oauth/github/callback": {
        get: {
          tags: ["Auth"],
          summary: "GitHub OAuth callback",
          responses: { 302: { description: "Redirect to CMS with tokens" } },
        },
      },
      "/api/cookie-consent": {
        post: {
          tags: ["Cookie Consent"],
          summary: "Store cookie consent choice",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CookieConsentRequest" },
              },
            },
          },
          responses: { 201: { description: "Stored" } },
        },
      },
      "/api/hero": {
        get: {
          tags: ["Hero"],
          summary: "Get hero content",
          responses: { 200: { description: "Hero object" } },
        },
        put: {
          tags: ["Hero"],
          summary: "Update hero content",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated hero" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/about": {
        get: {
          tags: ["About"],
          summary: "Get About Me section content",
          responses: { 200: { description: "About object" } },
        },
        put: {
          tags: ["About"],
          summary: "Update About Me section (CMS)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated about" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/uploads": {
        post: {
          tags: ["Uploads"],
          summary: "Upload an image or PDF (CMS)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary" },
                  },
                  required: ["file"],
                },
              },
            },
          },
          responses: {
            201: { description: "Uploaded file metadata with /uploads URL" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/what-i-do": {
        get: {
          tags: ["What I Do"],
          summary: "Get What I Do section",
          responses: { 200: { description: "Section with items" } },
        },
        put: {
          tags: ["What I Do"],
          summary: "Update What I Do section (CMS)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/skills-section": {
        get: {
          tags: ["Skills Section"],
          summary: "Get Skills section content",
          responses: { 200: { description: "Skills section payload" } },
        },
        put: {
          tags: ["Skills Section"],
          summary: "Update Skills section (CMS)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/skills": {
        get: {
          tags: ["Skills"],
          summary: "List skills (public = visible only)",
          parameters: [
            {
              name: "visible",
              in: "query",
              schema: { type: "string", example: "true" },
            },
          ],
          responses: { 200: { description: "Skill array" } },
        },
        post: {
          tags: ["Skills"],
          summary: "Create skill",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/skills/{id}": {
        get: {
          tags: ["Skills"],
          summary: "Get skill by id",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Skill" }, 404: { description: "Not found" } },
        },
        put: {
          tags: ["Skills"],
          summary: "Update skill",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
        },
        delete: {
          tags: ["Skills"],
          summary: "Delete skill",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/projects": {
        get: {
          tags: ["Projects"],
          summary:
            "Public: lean ProjectsSectionPayload (card images for 1-by-1 rotation). CMS (auth): raw project array",
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ProjectsSectionPayload" },
                      {
                        type: "array",
                        items: { type: "object" },
                        description: "Authenticated CMS list",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Projects"],
          summary: "Create project (CMS)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectWrite" },
              },
            },
          },
          responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/projects-section": {
        get: { tags: ["Projects"], summary: "Get projects section settings", responses: { 200: { description: "OK" } } },
        put: {
          tags: ["Projects"],
          summary: "Update projects section settings",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/projects/{id}": {
        get: {
          tags: ["Projects"],
          summary:
            "Public: ProjectDetailPayload (full case study + gallery). CMS (auth): raw Prisma row",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Project cuid or slug",
            },
          ],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ProjectDetailPayload" },
                      { type: "object", description: "Authenticated CMS row" },
                    ],
                  },
                },
              },
            },
            404: { description: "Not found" },
          },
        },
        put: {
          tags: ["Projects"],
          summary: "Update project (CMS)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectWrite" },
              },
            },
          },
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
        },
        delete: {
          tags: ["Projects"],
          summary: "Delete project",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/projects/{id}/likes": {
        post: { tags: ["Projects"], summary: "Like or unlike a project", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
      },
      "/api/projects/{id}/views": {
        post: { tags: ["Projects"], summary: "Increment project views", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
      },
      "/api/projects/{id}/comments": {
        post: { tags: ["Projects"], summary: "Add a project comment", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 201: { description: "Created" } } },
      },
      "/api/experience": {
        get: { tags: ["Experience"], summary: "List experience", responses: { 200: { description: "OK" } } },
        post: { tags: ["Experience"], summary: "Create experience", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } } },
      },
      "/api/experience/{id}": {
        get: { tags: ["Experience"], summary: "Get experience", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
        put: { tags: ["Experience"], summary: "Update experience", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
        delete: { tags: ["Experience"], summary: "Delete experience", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
      },
      "/api/education": {
        get: { tags: ["Education"], summary: "List education", responses: { 200: { description: "OK" } } },
        post: { tags: ["Education"], summary: "Create education", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } } },
      },
      "/api/education/{id}": {
        get: { tags: ["Education"], summary: "Get education", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
        put: { tags: ["Education"], summary: "Update education", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
        delete: { tags: ["Education"], summary: "Delete education", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
      },
      "/api/certificates": {
        get: { tags: ["Certificates"], summary: "List certificates", responses: { 200: { description: "OK" } } },
        post: { tags: ["Certificates"], summary: "Create certificate", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } } },
      },
      "/api/certificates/{id}": {
        get: { tags: ["Certificates"], summary: "Get certificate", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
        put: { tags: ["Certificates"], summary: "Update certificate", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
        delete: { tags: ["Certificates"], summary: "Delete certificate", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
      },
      "/api/social-links": {
        get: { tags: ["Social Links"], summary: "List social links", responses: { 200: { description: "OK" } } },
        post: { tags: ["Social Links"], summary: "Create social link", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } } },
      },
      "/api/social-links/{id}": {
        get: { tags: ["Social Links"], summary: "Get social link", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
        put: { tags: ["Social Links"], summary: "Update social link", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
        delete: { tags: ["Social Links"], summary: "Delete social link", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
      },
      "/api/contact-info": {
        get: { tags: ["Contact Info"], summary: "Get contact info", responses: { 200: { description: "OK" } } },
        put: { tags: ["Contact Info"], summary: "Update contact info", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
      },
      "/api/footer": {
        get: { tags: ["Footer"], summary: "Get portfolio footer (contact ending + socials)", responses: { 200: { description: "OK" } } },
        put: { tags: ["Footer"], summary: "Update footer copy", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
      },
      "/api/settings": {
        get: { tags: ["Settings"], summary: "Get site settings", responses: { 200: { description: "OK" } } },
        put: { tags: ["Settings"], summary: "Update site settings", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
      },
      "/api/meeting": {
        get: {
          tags: ["Meeting"],
          summary: "Get meeting / Let's Talk settings",
          description:
            "Public scheduler config for the Let's Talk page (host, durations, timezone, fallback meetUrl).",
          responses: {
            200: {
              description: "Meeting settings",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MeetingSettings" },
                },
              },
            },
          },
        },
        put: {
          tags: ["Meeting"],
          summary: "Update meeting settings (CMS)",
          description:
            "Includes optional meetUrl fallback and guest/host email templates ({{meetUrl}} token supported).",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeetingSettings" },
              },
            },
          },
          responses: {
            200: {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MeetingSettings" },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/meeting/slots": {
        get: {
          tags: ["Meeting"],
          summary: "List available meeting slots",
          description:
            "Returns time slots for one local calendar day in the host timezone.",
          parameters: [
            {
              name: "date",
              in: "query",
              required: true,
              schema: { type: "string", format: "date", example: "2026-08-05" },
              description: "YYYY-MM-DD in host timezone",
            },
            {
              name: "duration",
              in: "query",
              required: false,
              schema: { type: "integer", enum: [30, 60], default: 30 },
              description: "Meeting length in minutes",
            },
          ],
          responses: {
            200: {
              description: "Available slots",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MeetingSlotsResponse" },
                },
              },
            },
          },
        },
      },
      "/api/meeting/bookings": {
        get: {
          tags: ["Meeting"],
          summary: "List meeting bookings (admin)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Bookings list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/MeetingBooking" },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
        post: {
          tags: ["Meeting"],
          summary: "Book a meeting (public)",
          description:
            "Creates the booking, generates a unique Google Meet link via Calendar API when GOOGLE_REFRESH_TOKEN is configured (else uses settings/env meetUrl), emails guest + host with Join Meet CTA + .ics attachment.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeetingBookingRequest" },
                example: {
                  guestName: "Alex Guest",
                  guestEmail: "guest@example.com",
                  subject: "Portfolio chat",
                  notes: "Looking forward to talking.",
                  startAt: "2026-08-05T03:30:00.000Z",
                  durationMin: 30,
                },
              },
            },
          },
          responses: {
            201: {
              description: "Booking created; emails may include Meet link",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MeetingBookingResponse" },
                },
              },
            },
            400: { description: "Validation error" },
            403: { description: "Booking disabled" },
            409: { description: "Slot no longer available" },
          },
        },
      },
      "/api/meeting/analytics": {
        get: {
          tags: ["Meeting"],
          summary: "Meeting booking analytics (admin)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Counts + recent bookings" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/meeting/bookings/{id}": {
        patch: {
          tags: ["Meeting"],
          summary: "Cancel booking (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Updated (status cancelled)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MeetingBooking" },
                },
              },
            },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
          },
        },
        delete: {
          tags: ["Meeting"],
          summary: "Delete booking (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Deleted" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
          },
        },
      },
      "/api/messages": {
        get: {
          tags: ["Messages"],
          summary: "List messages (admin)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
        },
        post: {
          tags: ["Messages"],
          summary: "Create message (public; saves + emails)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "body"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    subject: { type: "string" },
                    body: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Saved (email may be skipped if SMTP missing)" } },
        },
      },
      "/api/messages/{id}": {
        get: { tags: ["Messages"], summary: "Get message", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
        patch: { tags: ["Messages"], summary: "Mark read/unread", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
        delete: { tags: ["Messages"], summary: "Delete message", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
