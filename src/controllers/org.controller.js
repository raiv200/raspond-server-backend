const orgService = require('../services/org.service');
const { success } = require('../utils/response');

async function getOrg(req, res, next) {
  try { return success(res, await orgService.getOrgDetails(req.org.id)); } catch (err) { next(err); }
}
async function updateOrg(req, res, next) {
  try { return success(res, await orgService.updateOrg(req.org.id, req.body), 'Organization updated'); } catch (err) { next(err); }
}
async function deleteOrg(req, res, next) {
  try {
    await orgService.deleteOrg(req.org.id, req.user.id);
    return success(res, null, 'Organization deleted successfully');
  } catch (err) { next(err); }
}

module.exports = { getOrg, updateOrg, deleteOrg };
