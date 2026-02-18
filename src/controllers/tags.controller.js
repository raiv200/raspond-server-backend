const tagsService = require('../services/tags.service');
const { success, created, badRequest } = require('../utils/response');

async function createTag(req, res, next) {
  try {
    const { header, subheader } = req.body;
    if (!header || !subheader) return badRequest(res, 'header and subheader are required');
    const tag = await tagsService.createTag(req.org.id, req.user.id, { header, subheader });
    return created(res, { tag }, 'Tag created');
  } catch (err) {
    next(err);
  }
}

async function bulkCreateTags(req, res, next) {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags) || tags.length === 0) return badRequest(res, 'tags array is required');
    const result = await tagsService.bulkCreateTags(req.org.id, req.user.id, tags);
    return created(res, { count: result.count }, 'Tags created');
  } catch (err) {
    next(err);
  }
}

async function getAllTags(req, res, next) {
  try {
    const tags = await tagsService.getAllTags(req.org.id);
    return success(res, { tags });
  } catch (err) {
    next(err);
  }
}

async function getTagStats(req, res, next) {
  try {
    const tags = await tagsService.getTagStats(req.org.id);
    return success(res, { tags });
  } catch (err) {
    next(err);
  }
}

async function getTag(req, res, next) {
  try {
    const tag = await tagsService.getTagById(req.params.id, req.org.id);
    return success(res, { tag });
  } catch (err) {
    next(err);
  }
}

async function updateTag(req, res, next) {
  try {
    const { header, subheader } = req.body;
    const tag = await tagsService.updateTag(req.params.id, req.org.id, { header, subheader });
    return success(res, { tag }, 'Tag updated');
  } catch (err) {
    next(err);
  }
}

async function deleteTag(req, res, next) {
  try {
    await tagsService.deleteTag(req.params.id, req.org.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getUniqueHeaders(req, res, next) {
  try {
    const headers = await tagsService.getUniqueHeaders(req.org.id);
    return success(res, { headers });
  } catch (err) {
    next(err);
  }
}

async function getTagsByHeader(req, res, next) {
  try {
    const tags = await tagsService.getTagsByHeader(req.org.id, req.params.header);
    return success(res, { tags });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTag,
  bulkCreateTags,
  getAllTags,
  getTagStats,
  getTag,
  updateTag,
  deleteTag,
  getUniqueHeaders,
  getTagsByHeader,
};
