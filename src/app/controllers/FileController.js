import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    await File.create({
      name,
      path,
    });

    const listFiles = await File.findAll();

    return res.json(listFiles);
  }
}

export default new FileController();
