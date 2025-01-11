export const calculateColumns = (cards, condition) =>
  cards?.filter(condition).reduce((acc, card) => {
    acc[card.column] = acc[card.column] || [];
    acc[card.column].push(card);
    return acc;
  }, {});
