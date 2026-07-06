const express = require('express');
const router = express.Router();
const {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} = require('../controllers/package.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.route('/')
  .get(getPackages)
  .post(authenticate, authorize('admin'), createPackage);

router.route('/:id')
  .get(getPackageById)
  .put(authenticate, authorize('admin'), updatePackage)
  .patch(authenticate, authorize('admin'), updatePackage)
  .delete(authenticate, authorize('admin'), deletePackage);

module.exports = router;
