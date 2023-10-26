import { ISO8601Date } from "./iso8601.d";

export type ID = string | null | undefined;

export type DataLayoutType = "segment" | "jitsu-legacy" | "segment-single-table" | "passthrough";

/**
 * Event coming from client library
 */
export interface AnalyticsClientEvent {
  /**
   * Unique message ID
   */
  messageId: string;
  timestamp?: Date | ISO8601Date;
  type: "track" | "page" | "identify" | "group" | "alias" | "screen";
  // page specific
  category?: string;
  name?: string;

  properties?: {
    [k: string]: JSONValue;
  };
  /**
   * Traits can be either here, or in context.traits (depending on a library)
   */
  traits?: JSONObject;

  context: AnalyticsContext;

  userId?: ID;
  anonymousId?: ID;
  groupId?: ID;
  previousId?: ID;

  event?: string;
  writeKey?: string;
  sentAt?: Date | ISO8601Date;
}

export type ServerContextReservedProps = {
  //always filled with an IP from where request came from
  //if request came server-to-server, then it's an IP of a server
  //for device events it will be an IP of a device
  //don't use this field in functions, use context.ip instead
  request_ip?: string;
  receivedAt?: ISO8601Date;
  sentAt?: ISO8601Date;
  timestamp?: ISO8601Date;
  userId?: ISO8601Date;
  type?: ISO8601Date;
};
/**
 * A context of an event that is added on server-side
 */
export type ServerContext = ServerContextReservedProps & { [k: string]: any };

interface ProcessingContext {
  $table?: string;

  [k: `$${string}`]: any;
}

export type AnalyticsServerEvent = AnalyticsClientEvent & ServerContext & ProcessingContext;

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

export type Integrations = {
  All?: boolean;
  [integration: string]: boolean | JSONObject | undefined;
};

export type Options = {
  integrations?: Integrations;
  userId?: ID;
  anonymousId?: ID;
  timestamp?: Date | string;
  context?: AnalyticsContext;
  traits?: JSONObject;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

type CompactMetricType = "g" | "c";

export interface CompactMetric {
  m: string; // metric name
  v: number; // value
  k: CompactMetricType;
  t: string[]; // tags
  e: number; // timestamp in unit milliseconds
}

export type PageReservedProps = {
  path?: string;
  referrer?: string;
  host?: string;
  referring_domain?: string;
  search?: string;
  title?: string;
  url?: string;
};

interface AnalyticsContext {
  /**
   * IP address of the originating request. If event is sent from a device, then it's an IP of a device
   * (copied from request_ip)
   * If request is sent from server-to-server, this field is not automatically populated
   * and should be filled manually
   */
  ip?: string;

  page?: PageReservedProps & { [key: string]: any };
  metrics?: CompactMetric[];

  userAgent?: string;

  userAgentVendor?: string;

  locale?: string;

  library?: {
    name: string;
    version: string;
  };

  traits?: { crossDomainId?: string } & JSONObject;

  campaign?: {
    name?: string;
    term?: string;
    source?: string;
    medium?: string;
    content?: string;
    [key: string]: any;
  };

  referrer?: {
    btid?: string;
    urid?: string;
  };

  amp?: {
    id: string;
  };
  /**
   * Other tracking tools client ids
   */
  clientIds?: {
    //Client ID of GA4 property
    ga4?: string;
    [key: string]: string;
  };

  [key: string]: any;
}

export type Context = any;
export type DispatchedEvent = Context;

export type Callback = (ctx: Context | undefined) => Promise<unknown> | unknown;

export interface AnalyticsInterface {
  track(
    eventName: string | JSONObject,
    properties?: JSONObject | Callback,
    options?: Options | Callback,
    callback?: Callback
  ): Promise<DispatchedEvent>;

  page(
    category?: string | object,
    name?: string | object | Callback,
    properties?: object | Options | Callback | null,
    options?: Options | Callback,
    callback?: Callback
  ): Promise<DispatchedEvent>;

  group(
    groupId?: ID | object,
    traits?: JSONObject | null,
    options?: Options,
    callback?: Callback
  ): Promise<DispatchedEvent>;

  identify(id?: ID | object, traits?: JSONObject | Callback | null, callback?: Callback): Promise<DispatchedEvent>;

  reset(callback?: (...params: any[]) => any): Promise<any>;

  user(): any;

  // alias(
  //   to: string | number,
  //   from?: string | number | Options,
  //   options?: Options | Callback,
  //   callback?: Callback
  // ): Promise<DispatchedEvent>;

  // screen(
  //   category?: string | object,
  //   name?: string | object | Callback,
  //   properties?: JSONObject | Options | Callback | null,
  //   options?: Options | Callback,
  //   callback?: Callback
  // ): Promise<DispatchedEvent>;
}
