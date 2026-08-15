/**
 * Source connector registry.
 *
 * Every geospatial data source is a connector registered here.
 * Each connector extends BaseConnector and implements:
 *   discover() fetch() parse() normalize()
 * (validate / deduplicate / store are shared in BaseConnector.)
 */

import { NbsConnector } from "./nbs/connector.js";
import { OsmConnector } from "./osm/connector.js";
import { HdxConnector } from "./hdx/connector.js";
import { WorldBankConnector } from "./worldbank/connector.js";
import { FaoConnector } from "./fao/connector.js";
import { WorldPopConnector } from "./worldpop/connector.js";
import { NasaConnector } from "./nasa/connector.js";
import { UsgsConnector } from "./usgs/connector.js";
import { CopernicusConnector } from "./copernicus/connector.js";

const connectors = new Map();

export function register(connector) {
  connectors.set(connector.slug, connector);
  return connector;
}

export const CONNECTORS = [
  new NbsConnector(),
  new OsmConnector(),
  new HdxConnector(),
  new WorldBankConnector(),
  new FaoConnector(),
  new WorldPopConnector(),
  new NasaConnector(),
  new UsgsConnector(),
  new CopernicusConnector(),
].map(register);

export function getConnector(slug) {
  return connectors.get(slug);
}

export function listConnectors() {
  return CONNECTORS.map((c) => ({
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    country: c.country,
    type: c.type,
    websiteUrl: c.websiteUrl,
    priority: c.priority,
    enabled: true,
  }));
}

/** Run a single connector's pipeline. */
export async function runConnector(slug) {
  const connector = getConnector(slug);
  if (!connector) throw new Error(`Unknown source connector: ${slug}`);
  return connector.run();
}

/** Run all registered connectors sequentially. */
export async function runAllConnectors() {
  const results = [];
  for (const connector of CONNECTORS) {
    try {
      results.push(await connector.run());
    } catch (err) {
      results.push({
        source: connector.name,
        error: err.message,
        discovered: 0,
        created: 0,
        updated: 0,
        duplicates: 0,
        brokenLinks: 0,
        parseErrors: 1,
        logs: [{ level: "ERROR", message: err.message }],
      });
    }
  }
  return results;
}