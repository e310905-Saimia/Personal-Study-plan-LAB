import { createSlice } from '@reduxjs/toolkit';

// Helper function to normalize outcome compulsory status
const normalizeCompulsory = (outcome) => {
  if (outcome && outcome.hasOwnProperty('compulsory')) {
    if (typeof outcome.compulsory === 'boolean') {
      return outcome.compulsory;
    } else if (typeof outcome.compulsory === 'string') {
      return outcome.compulsory.toLowerCase() === 'true';
    } else if (typeof outcome.compulsory === 'number') {
      return outcome.compulsory === 1;
    }
  }
  return false; // Default to false if undefined or any other type
};

const initialState = {
    subjects: [], 
    loading: false,
    error: null
};

const subjectSlice = createSlice({
    name: "subject",
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            
            // Process subjects to ensure compulsory field is properly normalized
            const normalizedSubjects = action.payload.map(subject => {
                if (subject.outcomes && subject.outcomes.length > 0) {
                    return {
                        ...subject,
                        outcomes: subject.outcomes.map(outcome => ({
                            ...outcome,
                            compulsory: normalizeCompulsory(outcome)
                        }))
                    };
                }
                return subject;
            });
            
            state.subjects = normalizedSubjects;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const { getRequest, getSuccess, getFailed } = subjectSlice.actions;
export default subjectSlice.reducer;