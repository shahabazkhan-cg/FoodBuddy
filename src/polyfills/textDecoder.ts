// Polyfill TextEncoder/TextDecoder for React Native (Hermes) environments.
// The `fast-text-encoding` package is an IIFE that assigns TextEncoder and
// TextDecoder onto the global scope (`global` in Node/RN) as a side effect.
// We simply import it so the IIFE executes before any SSE code runs.
import "fast-text-encoding";

export {};
