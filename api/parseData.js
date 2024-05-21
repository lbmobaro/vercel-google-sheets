const carNames = {
  'elements/2715492-C': 'RIGHT SIDE Pilot Car',
  'elements/2715493-C': 'RIGHT SIDE Car #1',
  'elements/2715494-C': 'RIGHT SIDE Car #2',
  'elements/2715495-C': 'RIGHT SIDE Car #3',
  'elements/2715496-C': 'RIGHT SIDE Car #4',
  'elements/2715497-C': 'RIGHT SIDE Car #5',
  'elements/2715498-C': 'RIGHT SIDE Car #6',
  'elements/2715499-C': 'RIGHT SIDE Car #7',
  'elements/2715500-C': 'RIGHT SIDE Car #8',
  'elements/2715502-C': 'LEFT SIDE Pilot Car',
  'elements/2715503-C': 'LEFT SIDE Car #1',
  'elements/2715504-C': 'LEFT SIDE Car #2',
  'elements/2715505-C': 'LEFT SIDE Car #3',
  'elements/2715506-C': 'LEFT SIDE Car #4',
  'elements/2715507-C': 'LEFT SIDE Car #5',
  'elements/2715508-C': 'LEFT SIDE Car #6',
  'elements/2715509-C': 'LEFT SIDE Car #7',
  'elements/2715510-C': 'LEFT SIDE Car #8',
};

const adjustmentValues = {
  '-1': 'Loosened',
  '0': 'Unadjusted',
  '1': 'Tightened'
};

const assetNames = {
  'assets/19192-C': 'Train 1',
  'assets/19193-C': 'Train 2'
};

function parseData(data, userMap) {
  const adjustments = [];
  if (data.items && data.items.length > 0) {
    const asset = data.items[0].asset;
    const train = assetNames[asset] || 'Unknown Train';
    data.items.forEach(item => {
      if (item.values && item.values.length > 0) {
        item.values.forEach(value => {
          if (value.answers) {
            adjustments.push({
              train,
              carName: carNames[value.question],
              adjustment: adjustmentValues[value.answers[0]],
              time: formatDateTime(value.answered),
              user: userMap[item.user] || item.user
            });
          }
        });
      }
    });
  }
  console.log('Parsed data:', adjustments);
  return adjustments;
}

module.exports = { parseData };
