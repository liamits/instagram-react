const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

module.exports = { formatDate };
