// import { EventParser } from '@coral-xyz/anchor';
import { EventParser } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export interface ParsedEvent {
  name: string;
  data: any;
}


/**
 * Parse events from logs using only Anchor's EventParser
 */
export const parseEventsFromLogs = (logs: string[], eventParser: EventParser): ParsedEvent[] => {
  try {
    console.log(`🔍 Parsing ${logs.length} log lines with Anchor EventParser`);
    
    const events = Array.from(eventParser.parseLogs(logs));
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
    return !!(eventData.shope_pet && eventData.buyer && eventData.pet_name);
  } catch (error) {
    return false;
  }
};




