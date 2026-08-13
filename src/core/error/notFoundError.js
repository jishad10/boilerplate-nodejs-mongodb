const notFoundError = (req, res) => {
  res.status(404).json({ success: false, message: "Not Found", path: req.path });
};

export default notFoundError;