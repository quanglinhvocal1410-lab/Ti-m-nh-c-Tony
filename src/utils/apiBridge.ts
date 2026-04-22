/**
 * API Bridge for Google Apps Script deployment
 */

export const isGAS = typeof window !== 'undefined' && (window as any).google?.script?.run !== undefined;

export const gasApi = {
  async call(functionName: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!isGAS) {
        reject(new Error("Not in Google Apps Script environment"));
        return;
      }

      (window as any).google.script.run
        .withSuccessHandler((response: any) => {
          try {
            // GAS often returns JSON as a string
            if (typeof response === 'string' && (response.startsWith('{') || response.startsWith('['))) {
              resolve(JSON.parse(response));
            } else {
              resolve(response);
            }
          } catch (e) {
            resolve(response);
          }
        })
        .withFailureHandler((err: any) => reject(err))
        [functionName](...args);
    });
  }
};
