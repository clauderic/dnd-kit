export function getDeckOfCards() {
  const suits = ['♠', '♦', '♣', '♥'];
  const values = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ];
  const deck = [];

  for (var i = 0; i < suits.length; i++) {
    for (var x = 0; x < values.length; x++) {
      var card = {value: values[x], suit: suits[i]};
      deck.push(card);
    }
  }

  return deck;
}

export function shuffle(items: any[]) {
  for (var i = 0; i < 1000; i++) {
    var location1 = Math.floor(Math.random() * items.length);
    var location2 = Math.floor(Math.random() * items.length);
    var tmp = items[location1];

    items[location1] = items[location2];
    items[location2] = tmp;
  }

  return items;
}

export function getSuitColor(value: string) {
  if (value.includes('♥') || value.includes('♦')) {
    return '#f44336';
  }

  return undefined;
}
