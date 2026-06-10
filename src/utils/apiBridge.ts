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
  },
  
  async getLocation(): Promise<{ parameters: Record<string, string[]> }> {
    return new Promise((resolve) => {
      if (!isGAS || !(window as any).google?.script?.url?.getLocation) {
        // Fallback for non-GAS or if url object is missing
        const params = new URLSearchParams(window.location.search);
        const parameters: Record<string, string[]> = {};
        params.forEach((value, key) => {
          if (!parameters[key]) parameters[key] = [];
          parameters[key].push(value);
        });
        resolve({ parameters });
        return;
      }
      
      (window as any).google.script.url.getLocation((location: any) => {
        resolve(location);
      });
    });
  },

  pushHistory(params: Record<string, string>) {
    if (isGAS && (window as any).google?.script?.history) {
      (window as any).google.script.history.push(null, params);
    }
  }
};
