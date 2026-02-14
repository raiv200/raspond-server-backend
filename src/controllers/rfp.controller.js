const rfpService = require('../services/rfp.service');
const { success, created } = require('../utils/response');

async function listRfps(req, res, next) {
  try {
    const rfps = await rfpService.listOrgRfps(req.org.id, req.user.id, req.orgMember.role);
    return success(res, rfps);
  } catch (err) { next(err); }
}

async function getRfp(req, res, next) {
  try {
    const rfp = await rfpService.getRfpDetails(req.params.rfpId, req.user.id, req.orgMember.role);
    return success(res, rfp);
  } catch (err) { next(err); }
}

async function createFromStructure(req, res, next) {
  try {
    const rfp = await rfpService.createRfpFromStructure(req.org.id, req.user.id, req.body);
    return created(res, rfp, 'RFP created');
  } catch (err) { next(err); }
}

async function updateRfp(req, res, next) {
  try { return success(res, await rfpService.updateRfp(req.params.rfpId, req.body), 'RFP updated'); } catch (err) { next(err); }
}

async function updateStructure(req, res, next) {
  try { return success(res, await rfpService.updateStructure(req.params.rfpId, req.body), 'Structure updated'); } catch (err) { next(err); }
}

async function deleteRfp(req, res, next) {
  try { return success(res, await rfpService.deleteRfp(req.params.rfpId)); } catch (err) { next(err); }
}

async function getAnswer(req, res, next) {
  try { return success(res, await rfpService.getAnswer(req.params.qId)); } catch (err) { next(err); }
}

async function saveAnswer(req, res, next) {
  try { return success(res, await rfpService.saveAnswer(req.params.qId, req.body), 'Answer saved'); } catch (err) { next(err); }
}

async function addMembers(req, res, next) {
  try { return success(res, await rfpService.addRfpMembers(req.params.rfpId, req.body.userIds), 'Members added'); } catch (err) { next(err); }
}

async function removeMember(req, res, next) {
  try { return success(res, await rfpService.removeRfpMember(req.params.rfpId, req.params.userId)); } catch (err) { next(err); }
}

async function setSectionAccess(req, res, next) {
  try { return success(res, await rfpService.setSectionAccess(req.params.rfpId, req.body.access), 'Section access updated'); } catch (err) { next(err); }
}

async function getSectionAccess(req, res, next) {
  try { return success(res, await rfpService.getSectionAccess(req.params.rfpId)); } catch (err) { next(err); }
}

module.exports = { listRfps, getRfp, createFromStructure, updateRfp, updateStructure, deleteRfp, getAnswer, saveAnswer, addMembers, removeMember, setSectionAccess, getSectionAccess };
