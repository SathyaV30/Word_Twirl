export const getPerformanceLevel = (metric, cutoffs) => {
    let level = 'Novice';
    if (metric >= cutoffs.expert) {
        level = 'Expert';
    } else if (metric >= cutoffs.advanced) {
        level = 'Advanced';
    } else if (metric >= cutoffs.intermediate) {
        level = 'Intermediate';
    } else if (metric >= cutoffs.beginner) {
        level = 'Beginner';
    } else {
        level = 'Novice';
    }
    return level;
};

export const accuracyCutoffs = {
    novice: 40,
    beginner: 60,
    intermediate: 75,
    advanced: 90,
    expert: 91,
};

export const wordsFoundCutoffs = {
    '1 min': { novice: 3, beginner: 6, intermediate: 10, advanced: 15, expert: 20 },
    '3 min': { novice: 5, beginner: 10, intermediate: 15, advanced: 20, expert: 25 },
    '5 min': { novice: 8, beginner: 13, intermediate: 18, advanced: 23, expert: 30 },
};

export const averageWordLengthCutoffs = {
    novice: 3,
    beginner: 3.5,
    intermediate: 4,
    advanced: 5,
    expert: 6,
};