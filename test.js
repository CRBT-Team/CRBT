const roles = [
  {
    name: 'h',
    id: 1,
  },
  {
    name: 'e',
    id: 2,
  },
  {
    name: 'l',
    id: 3,
  },
];

// create object from roles with "id" as key and "name" as value
const rolesMap = roles.reduce((acc, cur) => {
  acc[cur.id] = cur.name;
  return acc;
}, {});

console.log(rolesMap);
