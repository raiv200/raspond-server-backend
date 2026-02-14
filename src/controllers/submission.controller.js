const submissionService = require('../services/submission.service');
const { success } = require('../utils/response');

async function exportRfp(req, res, next) {
  try { return success(res, await submissionService.exportRfp(req.params.rfpId, req.body.format)); } catch (err) { next(err); }
}
async function submitRfp(req, res, next) {
  try { return success(res, await submissionService.submitRfp(req.params.rfpId, req.user.id, req.body), 'RFP submitted'); } catch (err) { next(err); }
}
async function getSubmission(req, res, next) {
  try { return success(res, await submissionService.getSubmission(req.params.rfpId)); } catch (err) { next(err); }
}

module.exports = { exportRfp, submitRfp, getSubmission };
