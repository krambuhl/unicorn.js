exports.delay = setTimeout;
exports.repeat = setInterval;

exports.clear = function(tid) {
  clearTimeout(tid);
  clearInterval(tid);
}