const { DUMMY_RFP_STRUCTURE, generateRandomStructure } = require('../config/constants');

async function processUploadedDocument(file) {
  console.log('📄 ─── RFP Document Upload ───');
  console.log('   Name:', file.originalname);
  console.log('   Size:', (file.size / 1024).toFixed(1), 'KB');
  console.log('   Type:', file.mimetype);
  console.log('   Path:', file.path);
  console.log('────────────────────────────');

  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generate random structure each time for variety
  const structure = generateRandomStructure();

  return {
    fileName: file.originalname,
    fileSize: file.size,
    filePath: `/uploads/documents/${file.filename}`,
    structure,
  };
}

module.exports = { processUploadedDocument };
