declare module 'fastestsmallesttextencoderdecoder' {
  interface TextEncoder {
    encode(input?: string): Uint8Array;
  }

  declare var TextEncoder: {
    prototype: TextEncoder;
    new(): TextEncoder;
  };
}
