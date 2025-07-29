import { EventParser } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';

export interface ParsedEvent {
  name: string;
  data: any;
}


/**
 * Parse events from logs using only Anchor's EventParser
 */
export const parseEventsFromLogs = async (logs: anchor.web3.Logs, eventParser: EventParser, connection: Connection): Promise<ParsedEvent[]> => {
  try {
    console.log(`🔍 Parsing logs with Anchor EventParser`);

    const tx = await connection.getParsedTransaction(logs.signature);
    const events = eventParser.parseLogs(tx?.meta?.logMessages || []);

    const parsedEvents: ParsedEvent[] = [];
    for (const event of events) {
      if (event && event.name) {
        console.log(`✅ Found event: ${event.name}`);
        parsedEvents.push({
          name: event.name,
          data: event.data
        });
      }
    }

    return parsedEvents;
  } catch (error) {
    console.log(`⚠️ Anchor EventParser failed: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
};


/**
 * Validate parsed event data
 */
export const validateEventData = (eventData: any): boolean => {
  if (!eventData) return false;
  
  try {
    return !!(eventData.shopePet && eventData.buyer && eventData.petName);
  } catch (error) {
    return false;
  }
};




