import { baseApi } from './baseApi';
import type { ApiPantryItem, ApiResponse, PantryHealth, PantryPayload, ScanResult } from './types';

export const pantryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetch the full pantry response envelope.
     * The UI reads `data.payload.pantry_items` for the items list and
     * `data.message` / `data.artifacts` for contextual display.
     */
    getPantry: builder.query<ApiResponse<PantryPayload>, void>({
      query: () => '/pantry',
      providesTags: ['Pantry'],
    }),

    /** Pantry health score + freshness breakdown. */
    getPantryHealth: builder.query<PantryHealth, void>({
      query: () => '/pantry/health',
      providesTags: ['Pantry'],
    }),

    /** Add a new ingredient to the pantry. */
    addIngredient: builder.mutation<ApiPantryItem, Omit<ApiPantryItem, 'id'>>({
      query: (body) => ({ url: '/pantry', method: 'POST', body }),
      invalidatesTags: ['Pantry'],
    }),

    /** Update an existing ingredient (partial update). */
    updateIngredient: builder.mutation<
      ApiPantryItem,
      Partial<ApiPantryItem> & { id: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/pantry/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Pantry'],
    }),

    /** Remove an ingredient by id. */
    deleteIngredient: builder.mutation<void, number>({
      query: (id) => ({ url: `/pantry/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Pantry'],
    }),

    /** Upload a fridge / receipt image to detect ingredients. */
    scanIngredients: builder.mutation<ScanResult, FormData>({
      query: (body) => ({
        url: '/pantry/scan',
        method: 'POST',
        body,
        headers: { 'Content-Type': undefined as unknown as string },
      }),
    }),

    /** Confirm and save the items detected by a scan. */
    confirmScan: builder.mutation<ApiPantryItem[], ApiPantryItem[]>({
      query: (ingredients) => ({
        url: '/pantry/scan/confirm',
        method: 'POST',
        body: { ingredients },
      }),
      invalidatesTags: ['Pantry'],
    }),
  }),
});

export const {
  useGetPantryQuery,
  useGetPantryHealthQuery,
  useAddIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
  useScanIngredientsMutation,
  useConfirmScanMutation,
} = pantryApi;
