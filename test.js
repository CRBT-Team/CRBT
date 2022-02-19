function get(key, filter) {
  const query = key.split('.');
  const symbols = {
    '==': 'eq',
    '>': 'gt',
    '<': 'lt',
  };

  console.log(query, symbols[filter[1]], filter[0], filter[2]);
}

console.log(get('table.spoon', ['one', '==', 'two']));
