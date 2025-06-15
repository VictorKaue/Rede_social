const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'uploads/perfis',
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + '_' + file.originalname;
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });
module.exports = upload;