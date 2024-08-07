export const getPerformanceLevel = (metric, cutoffs) => {
    if (metric >= cutoffs.expert) {
        level = 'Expert';
        color = colorCutoffs.expert;
    } else if (metric >= cutoffs.advanced) {
        level = 'Advanced';
        color = colorCutoffs.advanced; 
    } else if (metric >= cutoffs.intermediate) {
        level = 'Intermediate';
        color = colorCutoffs.intermediate; 
    } else if (metric >= cutoffs.beginner) {
        level = 'Beginner';
        color = colorCutoffs.beginner; 
    } else {
        level = 'Novice';
        color = colorCutoffs.novice; 
    }
    return {level, color};
};


export const colorCutoffs = {
    novice: '#d60000',
    beginner: '#d4b401',
    intermediate: '#c4d600',
    advanced: '#67bf16',
    expert: '#2acf06',
};

export const accuracyCutoffs = {
    novice: 45,
    beginner: 55,
    intermediate: 65,
    advanced: 75,
    expert: 85,
};

export const wordsFoundCutoffs = {
    '1 min': { novice: 3, beginner: 6, intermediate: 10, advanced: 15, expert: 20 },
    '3 min': { novice: 5, beginner: 10, intermediate: 15, advanced: 20, expert: 25 },
    '5 min': { novice: 8, beginner: 13, intermediate: 18, advanced: 23, expert: 30 },
};

export const averageWordLengthCutoffs = {
    novice: 2,
    beginner: 2.5,
    intermediate: 3,
    advanced: 3.5,
    expert: 4,
};


