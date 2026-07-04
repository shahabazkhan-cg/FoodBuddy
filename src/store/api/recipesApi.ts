import { baseApi } from './baseApi';
import type { ApiRecipe, MealPlanDay } from './types';

export const recipesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** All available recipes. */
    getRecipes: builder.query<ApiRecipe[], void>({
      query: () => '/recipes',
      providesTags: ['Recipes'],
    }),

    /** Single recipe by id. */
    getRecipe: builder.query<ApiRecipe, string>({
      query: (id) => `/recipes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Recipes', id }],
    }),

    /** AI-suggested recipes based on current pantry state. */
    getSuggestedRecipes: builder.query<ApiRecipe[], void>({
      query: () => '/recipes/suggested',
      providesTags: ['Recipes', 'Pantry'],
    }),

    /** Current week's meal plan. */
    getMealPlan: builder.query<MealPlanDay[], void>({
      query: () => '/meal-plan',
      providesTags: ['MealPlan'],
    }),

    /** Ask the AI to regenerate the meal plan based on pantry + preferences. */
    generateMealPlan: builder.mutation<MealPlanDay[], void>({
      query: () => ({ url: '/meal-plan/generate', method: 'POST' }),
      invalidatesTags: ['MealPlan'],
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useGetRecipeQuery,
  useGetSuggestedRecipesQuery,
  useGetMealPlanQuery,
  useGenerateMealPlanMutation,
} = recipesApi;
