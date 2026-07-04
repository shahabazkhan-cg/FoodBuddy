import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Pre-typed version of `useDispatch`.
 * Use this everywhere instead of plain `useDispatch` so thunk types flow correctly.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Pre-typed version of `useSelector`.
 * Use this everywhere instead of plain `useSelector` for full RootState inference.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
