declare module 'resend' {
  export class Resend {
    constructor(apiKey: string);
    emails: {
      send: (data: any) => Promise<any>;
    };
  }
}
