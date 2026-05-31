import { Router, Request, Response } from 'express';
import { uploadSingleImage } from '../middlewares/uploadMiddleware';

const router = Router();

/**
 * @desc    Upload an image file
 * @route   POST /api/upload
 * @access  Public
 */
router.post('/', uploadSingleImage('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({
      status: 'fail',
      message: 'Please provide a file to upload.',
    });
    return;
  }

  // Construct static path for the client to save
  const imageUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    status: 'success',
    message: 'Image uploaded successfully.',
    url: imageUrl,
  });
});

export default router;
