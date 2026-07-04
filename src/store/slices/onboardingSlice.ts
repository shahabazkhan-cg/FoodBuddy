import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OnboardingState {
  answers: Record<number, string[]>;
}

const initialState: OnboardingState = {
  answers: {},
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setAnswer: (
      state,
      action: PayloadAction<{
        step: number;
        answers: string[];
      }>
    ) => {
      state.answers[action.payload.step] = action.payload.answers;
    },

    clearAnswers: (state) => {
      state.answers = {};
    },
  },
});

export const { setAnswer, clearAnswers } = onboardingSlice.actions;

export default onboardingSlice.reducer;