function formatDateTime(dateTimeStr) {
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  };
  const date = new Date(dateTimeStr);
  return new Intl.DateTimeFormat('en-US', options).format(date).replace(',', ' at');
}

module.exports = formatDateTime;
