const approvalService = require('../services/approval.service');
const { success } = require('../utils/response');

async function getApprovals(req, res, next) {
  try { return success(res, await approvalService.getApprovals(req.params.rfpId)); } catch (err) { next(err); }
}
async function approveSection(req, res, next) {
  try { return success(res, await approvalService.approveSection(req.params.rfpId, req.params.sectionId, req.user.id, req.body.notes), 'Section approved'); } catch (err) { next(err); }
}
async function requestChanges(req, res, next) {
  try { return success(res, await approvalService.requestChanges(req.params.rfpId, req.params.sectionId, req.user.id, req.body.notes), 'Changes requested'); } catch (err) { next(err); }
}
async function approveDocument(req, res, next) {
  try { return success(res, await approvalService.approveDocument(req.params.rfpId, req.user.id, req.body.notes), 'Document approved'); } catch (err) { next(err); }
}
async function getReviewStatus(req, res, next) {
  try { return success(res, await approvalService.getReviewStatus(req.params.rfpId)); } catch (err) { next(err); }
}

module.exports = { getApprovals, approveSection, requestChanges, approveDocument, getReviewStatus };
