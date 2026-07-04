/**
 * Network Debugging Utilities
 *
 * Use these to diagnose network and API connectivity issues.
 * Available in development console as: __FOODBUDDY_DEBUG__.checkNetwork()
 */

import { logger } from './logger';

declare const __DEV__: boolean;

/**
 * Test basic network connectivity
 */
export async function testNetworkConnectivity(): Promise<{
  hasConnection: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok && response.status !== 200) {
      logger.warn('Network', `Google ping returned ${response.status}`);
    }

    return {
      hasConnection: true,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    logger.error('Network', 'Connectivity test failed', {
      error: errorMsg,
      latency,
    });

    return {
      hasConnection: false,
      latency,
      error: errorMsg,
    };
  }
}

/**
 * Test connection to the FoodBuddy API backend
 */
export async function testAPIEndpoint(
  url: string = 'https://chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net',
): Promise<{
  reachable: boolean;
  statusCode?: number;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    logger.debug('Network', `Testing API endpoint: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
    } catch (err) {
      // If OPTIONS fails, try GET (some servers don't support OPTIONS)
      logger.debug('Network', 'OPTIONS failed, trying GET');
      response = await fetch(url, {
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    logger.info('Network', `API test response: ${response.status}`, {
      statusCode: response.status,
      latency,
      url,
    });

    return {
      reachable: response.ok || response.status < 500,
      statusCode: response.status,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    logger.error('Network', 'API endpoint test failed', {
      error: errorMsg,
      latency,
      url,
    });

    return {
      reachable: false,
      latency,
      error: errorMsg,
    };
  }
}

/**
 * Test SSE endpoint specifically (simulates chat stream opening)
 */
export async function testSSEEndpoint(
  url: string = 'https://chatbot-python-frgpase9e5csbkef.westeurope-01.azurewebsites.net/chat/sse',
): Promise<{
  reachable: boolean;
  supportsSSE: boolean;
  statusCode?: number;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    logger.debug('Network', `Testing SSE endpoint: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        user_input: 'test',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';
    const supportsSSE = contentType.includes('event-stream') || contentType.includes('text/plain');

    logger.info('Network', `SSE endpoint test response: ${response.status}`, {
      statusCode: response.status,
      contentType,
      supportsSSE,
      latency,
    });

    return {
      reachable: response.ok || response.status < 500,
      supportsSSE,
      statusCode: response.status,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    logger.error('Network', 'SSE endpoint test failed', {
      error: errorMsg,
      latency,
      url,
    });

    return {
      reachable: false,
      supportsSSE: false,
      latency,
      error: errorMsg,
    };
  }
}

/**
 * Test with public Pokemon API (simple GET request to verify API calls work)
 */
export async function testPokemonAPI(): Promise<{
  success: boolean;
  statusCode?: number;
  pokemonName?: string;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    logger.debug('Network', 'Testing Pokemon API (simple GET request)');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu', {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok) {
      logger.warn('Network', `Pokemon API returned ${response.status}`, { latency });
      return {
        success: false,
        statusCode: response.status,
        latency,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    const pokemonName = data?.name || 'Unknown';

    logger.info('Network', `✓ Pokemon API test successful: ${pokemonName}`, {
      statusCode: response.status,
      pokemonName,
      latency,
    });

    return {
      success: true,
      statusCode: response.status,
      pokemonName,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    logger.error('Network', '✗ Pokemon API test failed', {
      error: errorMsg,
      latency,
    });

    return {
      success: false,
      latency,
      error: errorMsg,
    };
  }
}

/**
 * Run all network diagnostics
 */
export async function runNetworkDiagnostics() {
  if (!__DEV__) {
    logger.warn('Network', 'Diagnostics only available in development');
    return;
  }

  logger.info('Network', '=== Starting Network Diagnostics ===');

  // Test 0: Pokemon API (simple public API test)
  logger.info('Network', 'Test 0: Pokemon API (Public API)');
  const pokemonTest = await testPokemonAPI();
  logger.info('Network', `Result: ${pokemonTest.success ? '✓ Success' : '✗ Failed'}`, {
    ...pokemonTest,
  });

  // Test 1: Basic connectivity
  logger.info('Network', 'Test 1: Basic Internet Connectivity');
  const connectivity = await testNetworkConnectivity();
  logger.info('Network', `Result: ${connectivity.hasConnection ? '✓ Connected' : '✗ No connection'}`, {
    ...connectivity,
  });

  // Test 2: API endpoint
  logger.info('Network', 'Test 2: API Endpoint Reachability');
  const apiTest = await testAPIEndpoint();
  logger.info('Network', `Result: ${apiTest.reachable ? '✓ Reachable' : '✗ Unreachable'}`, apiTest);

  // Test 3: SSE endpoint
  logger.info('Network', 'Test 3: SSE Endpoint');
  const sseTest = await testSSEEndpoint();
  logger.info('Network', `Result: ${sseTest.reachable ? '✓ Reachable' : '✗ Unreachable'}`, sseTest);

  logger.info('Network', '=== Diagnostics Complete ===');

  return {
    pokemon: pokemonTest,
    connectivity,
    api: apiTest,
    sse: sseTest,
  };
}

/**
 * Export for console debugging
 */
declare global {
  interface Window {
    __FOODBUDDY_DEBUG__?: Record<string, unknown>;
  }
}

if (__DEV__ && typeof window !== 'undefined') {
  window.__FOODBUDDY_DEBUG__ = window.__FOODBUDDY_DEBUG__ || {};
  Object.assign(window.__FOODBUDDY_DEBUG__, {
    testNetworkConnectivity,
    testPokemonAPI,
    testAPIEndpoint,
    testSSEEndpoint,
    runNetworkDiagnostics,
  });
}
