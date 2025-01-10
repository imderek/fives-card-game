import { evaluatePokerHand } from '../../utils/pokerHandEvaluator';

export const calculateTotalScore = (columns) => {
    return columns.reduce((total, column) => {
        const { score } = evaluatePokerHand(column);
        return total + score;
    }, 0);
};