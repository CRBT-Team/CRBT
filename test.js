//@ts-check

const poll = {
  title: 'Test',
  fields: [
    {
      name: 'Hi - pog',
      value: '⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ (0% - 0 votes)',
    },
    {
      name: 'Hello',
      value: '⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ (0% - 0 votes)',
    },
  ],
  footer: {
    text: 'Total votes: 0',
  },
};

/** @param {number} opt */
function vote(opt) {
  const totalVotes = Number(poll.footer.text.split(' ')[2]);
  poll.fields.forEach(({ name, value }, index) => {
    const votes = parseInt(value.split(' - ')[1].split(' ')[0]) + (index === opt ? 1 : 0);
    const percentage = Math.round((votes / (totalVotes + 1)) * 100);

    poll.fields[index].value = `${
      // render a progress bar where the percentage is the length of the bar in emojis
      '🟩'.repeat(Math.round(percentage / 10)) + '⬜'.repeat(10 - Math.round(percentage / 10))
    } ${percentage}% - ${votes} ${votes === 1 ? 'vote' : 'votes'}`;
  });
  poll.footer.text = `Total votes: ${totalVotes + 1}`;
  return poll;
}

console.log(vote(0));
