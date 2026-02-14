const assignmentService = require('../services/assignment.service');
const { success } = require('../utils/response');

async function getAssignments(req, res, next) {
  try { return success(res, await assignmentService.getAssignments(req.params.rfpId)); } catch (err) { next(err); }
}

async function bulkSetAssignments(req, res, next) {
  try { return success(res, await assignmentService.bulkSetAssignments(req.params.rfpId, req.org.id, req.body), 'Assignments updated'); } catch (err) { next(err); }
}

module.exports = { getAssignments, bulkSetAssignments };
