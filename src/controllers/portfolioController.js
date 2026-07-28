import { asyncHandler } from "../utils/asyncHandler.js";
import * as skillsService from "../services/skillsService.js";
import * as heroService from "../services/heroService.js";
import * as content from "../services/contentService.js";
import * as projects from "../services/projectsService.js";
import * as site from "../services/siteService.js";
import * as meeting from "../services/meetingService.js";
import * as whatIDo from "../services/whatIDoService.js";
import * as skillsSection from "../services/skillsSectionService.js";

export const getHero = asyncHandler(async (_req, res) => {
  res.json(await heroService.getHero());
});

export const putHero = asyncHandler(async (req, res) => {
  res.json(await heroService.updateHero(req.body));
});

export const getWhatIDo = asyncHandler(async (_req, res) => {
  res.json(await whatIDo.getWhatIDo());
});

export const putWhatIDo = asyncHandler(async (req, res) => {
  res.json(await whatIDo.updateWhatIDo(req.body));
});

export const getSkillsSection = asyncHandler(async (_req, res) => {
  res.json(await skillsSection.getSkillsSection());
});

export const putSkillsSection = asyncHandler(async (req, res) => {
  res.json(await skillsSection.updateSkillsSection(req.body));
});

function visibleOnlyForRequest(req) {
  // Public visitors always see published/visible content.
  // Authenticated CMS users can request the full list.
  if (req.user) return req.query.visible === "true";
  return true;
}

export const getSkills = asyncHandler(async (req, res) => {
  res.json(await skillsService.listSkills({ visibleOnly: visibleOnlyForRequest(req) }));
});

export const getSkill = asyncHandler(async (req, res) => {
  res.json(await skillsService.getSkillById(req.params.id));
});

export const postSkill = asyncHandler(async (req, res) => {
  res.status(201).json(await skillsService.createSkill(req.body));
});

export const putSkill = asyncHandler(async (req, res) => {
  res.json(await skillsService.updateSkill(req.params.id, req.body));
});

export const deleteSkill = asyncHandler(async (req, res) => {
  res.json(await skillsService.deleteSkill(req.params.id));
});

export const getProjects = asyncHandler(async (req, res) => {
  // CMS needs a raw array; the public site needs the section payload.
  if (req.user) {
    res.json(await projects.listProjectsAdmin({ visibleOnly: visibleOnlyForRequest(req) }));
    return;
  }
  res.json(await projects.getSectionPayload({ visibleOnly: true }));
});

export const getProjectsSection = asyncHandler(async (_req, res) => {
  res.json(await projects.getSectionSettings());
});

export const putProjectsSection = asyncHandler(async (req, res) => {
  res.json(await projects.updateSectionSettings(req.body));
});

export const getProject = asyncHandler(async (req, res) => {
  const map = !req.user;
  res.json(await projects.getProject(req.params.id, { map }));
});

export const postProject = asyncHandler(async (req, res) => {
  res.status(201).json(await projects.createProject(req.body));
});

export const putProject = asyncHandler(async (req, res) => {
  res.json(await projects.updateProject(req.params.id, req.body));
});

export const deleteProject = asyncHandler(async (req, res) => {
  res.json(await projects.deleteProject(req.params.id));
});

export const postProjectLike = asyncHandler(async (req, res) => {
  res.json(
    await projects.likeProject(req.params.id, {
      undo: Boolean(req.body?.undo),
    }),
  );
});

export const postProjectView = asyncHandler(async (req, res) => {
  res.json(await projects.bumpProjectView(req.params.id));
});

export const postProjectComment = asyncHandler(async (req, res) => {
  res.status(201).json(await projects.addComment(req.params.id, req.body));
});

export const getExperienceList = asyncHandler(async (req, res) => {
  res.json(await content.listExperience({ visibleOnly: visibleOnlyForRequest(req) }));
});
export const getExperienceOne = asyncHandler(async (req, res) => {
  res.json(await content.getExperience(req.params.id));
});
export const postExperience = asyncHandler(async (req, res) => {
  res.status(201).json(await content.createExperience(req.body));
});
export const putExperience = asyncHandler(async (req, res) => {
  res.json(await content.updateExperience(req.params.id, req.body));
});
export const deleteExperience = asyncHandler(async (req, res) => {
  res.json(await content.deleteExperience(req.params.id));
});

export const getEducationList = asyncHandler(async (req, res) => {
  res.json(await content.listEducation({ visibleOnly: visibleOnlyForRequest(req) }));
});
export const getEducationOne = asyncHandler(async (req, res) => {
  res.json(await content.getEducation(req.params.id));
});
export const postEducation = asyncHandler(async (req, res) => {
  res.status(201).json(await content.createEducation(req.body));
});
export const putEducation = asyncHandler(async (req, res) => {
  res.json(await content.updateEducation(req.params.id, req.body));
});
export const deleteEducation = asyncHandler(async (req, res) => {
  res.json(await content.deleteEducation(req.params.id));
});

export const getCertificates = asyncHandler(async (req, res) => {
  res.json(await content.listCertificates({ visibleOnly: visibleOnlyForRequest(req) }));
});
export const getCertificate = asyncHandler(async (req, res) => {
  res.json(await content.getCertificate(req.params.id));
});
export const postCertificate = asyncHandler(async (req, res) => {
  res.status(201).json(await content.createCertificate(req.body));
});
export const putCertificate = asyncHandler(async (req, res) => {
  res.json(await content.updateCertificate(req.params.id, req.body));
});
export const deleteCertificate = asyncHandler(async (req, res) => {
  res.json(await content.deleteCertificate(req.params.id));
});

export const getSocialLinks = asyncHandler(async (req, res) => {
  res.json(await content.listSocialLinks({ visibleOnly: visibleOnlyForRequest(req) }));
});
export const getSocialLink = asyncHandler(async (req, res) => {
  res.json(await content.getSocialLink(req.params.id));
});
export const postSocialLink = asyncHandler(async (req, res) => {
  res.status(201).json(await content.createSocialLink(req.body));
});
export const putSocialLink = asyncHandler(async (req, res) => {
  res.json(await content.updateSocialLink(req.params.id, req.body));
});
export const deleteSocialLink = asyncHandler(async (req, res) => {
  res.json(await content.deleteSocialLink(req.params.id));
});

export const getContactInfo = asyncHandler(async (_req, res) => {
  res.json(await site.getContactInfo());
});
export const putContactInfo = asyncHandler(async (req, res) => {
  res.json(await site.updateContactInfo(req.body));
});

export const getFooter = asyncHandler(async (_req, res) => {
  res.json(await site.getFooter());
});
export const putFooter = asyncHandler(async (req, res) => {
  res.json(await site.updateFooter(req.body));
});

export const getSettings = asyncHandler(async (_req, res) => {
  res.json(await site.getSiteSettings());
});
export const putSettings = asyncHandler(async (req, res) => {
  res.json(await site.updateSiteSettings(req.body));
});

export const getMessages = asyncHandler(async (_req, res) => {
  res.json(await site.listMessages());
});
export const getMessage = asyncHandler(async (req, res) => {
  res.json(await site.getMessage(req.params.id));
});
export const postMessage = asyncHandler(async (req, res) => {
  res.status(201).json(await site.createMessage(req.body));
});
export const patchMessage = asyncHandler(async (req, res) => {
  res.json(await site.markMessageRead(req.params.id, req.body.isRead !== false));
});
export const deleteMessage = asyncHandler(async (req, res) => {
  res.json(await site.deleteMessage(req.params.id));
});

export const getMeetingSettings = asyncHandler(async (_req, res) => {
  res.json(await meeting.getMeetingSettings());
});

export const putMeetingSettings = asyncHandler(async (req, res) => {
  res.json(await meeting.updateMeetingSettings(req.body));
});

export const getMeetingSlots = asyncHandler(async (req, res) => {
  res.json(
    await meeting.getAvailableSlots({
      date: req.query.date,
      duration: req.query.duration,
    }),
  );
});

export const postMeetingBooking = asyncHandler(async (req, res) => {
  res.status(201).json(await meeting.createMeetingBooking(req.body));
});

export const getMeetingBookings = asyncHandler(async (_req, res) => {
  res.json(await meeting.listMeetingBookings());
});

export const patchMeetingBooking = asyncHandler(async (req, res) => {
  res.json(await meeting.cancelMeetingBooking(req.params.id));
});

export const deleteMeetingBooking = asyncHandler(async (req, res) => {
  res.json(await meeting.deleteMeetingBooking(req.params.id));
});
