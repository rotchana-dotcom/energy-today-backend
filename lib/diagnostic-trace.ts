/**
 * Comprehensive Diagnostic Trace System
 * 
 * Logs every step of the data flow to identify exact breaking point
 */

export interface TracePoint {
  step: string;
  timestamp: number;
  success: boolean;
  data?: any;
  error?: string;
}

const traces: TracePoint[] = [];

export function trace(step: string, success: boolean, data?: any, error?: any): void {
  const tracePoint: TracePoint = {
    step,
    timestamp: Date.now(),
    success,
    data: data ? JSON.parse(JSON.stringify(data)) : undefined,
    error: error instanceof Error ? error.message : error ? String(error) : undefined
  };
  
  traces.push(tracePoint);
  
  const icon = success ? '✅' : '❌';
  console.log(`[TRACE] ${icon} ${step}`, data || error || '');
}

export function getTraces(): TracePoint[] {
  return [...traces];
}

export function clearTraces(): void {
  traces.length = 0;
}

export function printTraceReport(): void {
  console.log('\n========== DIAGNOSTIC TRACE REPORT ==========');
  console.log(`Total steps: ${traces.length}`);
  console.log(`Successful: ${traces.filter(t => t.success).length}`);
  console.log(`Failed: ${traces.filter(t => !t.success).length}`);
  console.log('\nDetailed trace:');
  
  traces.forEach((t, index) => {
    const icon = t.success ? '✅' : '❌';
    const duration = index > 0 ? `+${t.timestamp - traces[index - 1].timestamp}ms` : '0ms';
    console.log(`${index + 1}. ${icon} [${duration}] ${t.step}`);
    if (t.error) {
      console.error(`   ERROR: ${t.error}`);
    }
    if (t.data && !t.success) {
      console.log(`   DATA:`, t.data);
    }
  });
  
  console.log('============================================\n');
  
  // Find first failure
  const firstFailure = traces.find(t => !t.success);
  if (firstFailure) {
    console.error('🔴 FIRST FAILURE:', firstFailure.step);
    console.error('   Error:', firstFailure.error);
    console.error('   Data:', firstFailure.data);
  }
}
