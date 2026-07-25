import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Portfolio API",
      version: "1.1.0",
      description:
        "REST API for the public portfolio and CMS. CMS mutations require JWT Bearer access tokens. Refresh tokens are HttpOnly cookies under /api/auth.",
    },
    servers: [
      { url: env.apiPublicUrl, description: "Local" },
      ...(env.isProd && process.env.RENDER_EXTERNAL_URL
        ? [{ url: process.env.RENDER_EXTERNAL_URL, description: "Render" }]
        : []),
    ],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Cookie Consent" },
      { name: "Hero" },
      { name: "Skills" },
      { name: "Projects" },
      { name: "Experience" },
      { name: "Education" },
      { name: "Certificates" },
      { name: "Social Links" },
      { name: "Contact Info" },
      { name: "Settings" },
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
          summary: "Public: section payload. CMS (auth): project array",
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Projects"],
          summary: "Create project",
          security: [{ bearerAuth: [] }],
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
        get: { tags: ["Projects"], summary: "Get project by id or slug", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
        put: { tags: ["Projects"], summary: "Update project", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
        delete: { tags: ["Projects"], summary: "Delete project", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } } },
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
