import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { EventParser } from '@coral-xyz/anchor';
import { parseEventsFromLogs, validateEventData } from './parser';
import { storeEvent } from './db';
import idl from './indexing_demo.json';
import dotenv from 'dotenv';

dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || "https://api.devnet.solana.com";
const WS_ENDPOINT = process.env.WS_ENDPOINT || "wss://api.devnet.solana.com";
const PROGRAM_ID_STRING = process.env.PROGRAM_ID || "11111111111111111111111111111112";
const PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);

const connection = new Connection(RPC_ENDPOINT, {
    commitment: 'confirmed',
    wsEndpoint: WS_ENDPOINT,
  }
);

export const startListening = async (): Promise<void> => {
  try {
    console.log(`Starting to listen for events from program: ${PROGRAM_ID.toString()}`);
    console.log(`Connected to: ${RPC_ENDPOINT}`);

    const program = getProgram(connection);
    
    // Create event parser
    const eventParser = new EventParser(program.programId, program.coder);    

    // Listen to program logs
    const subscriptionId = connection.onLogs(
      PROGRAM_ID,
      async (logs, context) => {
        try {
          console.log(`📋 Received logs for signature: ${logs.signature}`);
          
          // Skip if there's an error in the transaction
          if (logs.err) {
            console.log(`⚠️ Transaction failed: ${logs.signature}`);
            return;
          }

          // Parse logs for events
          await processLogs(logs, eventParser);
          
        } catch (error) {
          console.error('❌ Error processing logs:', error);
        }
      },
      "confirmed"
    );

    console.log(`✅ Subscription ID: ${subscriptionId}`);
    console.log('👂 Listening for pet purchase events...');

  } catch (error) {
    console.error('❌ Failed to start listening:', error);
    throw error;
  }
};

async function processLogs(logs: any, eventParser: EventParser): Promise<void> {
  try {
    // Parse all events from logs using Anchor EventParser
    const events = await parseEventsFromLogs(logs, eventParser, connection);
    
    if (events.length === 0) {
      console.log(`ℹ️  No events found in logs`);
      return;
    }

    // Process each found event
    for (const event of events) {
      if (event.name === 'petPurchaseEvent') {
        console.log("🐶 Found Pet Purchase Event:");
        console.log(`  Event data:`, event.data);
        
        // Validate event data
        if (validateEventData(event.data)) {
          await handlePetPurchaseEvent(event.data, logs.signature);
        } else {
          console.log(`⚠️  Invalid event data, skipping`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in processLogs:', error);
  }
}


async function handlePetPurchaseEvent(eventData: any, signature: string): Promise<void> {
  try {
    console.log(`  Shop: ${eventData.shopePet?.toString() || 'Unknown'}`);
    console.log(`  Buyer: ${eventData.buyer?.toString() || 'Unknown'}`);
    console.log(`  Pet Name: ${eventData.petName || 'Unknown'}`);
    console.log(`  Signature: ${signature}`);

    // Store event in database
    await storeEvent({
      shop: eventData.shopePet?.toString() || 'Unknown',
      buyer: eventData.buyer?.toString() || 'Unknown',
      pet_name: eventData.petName || 'Unknown',
      signature: signature,
      timestamp: new Date()
    });

    console.log("💾 Event stored in database");
  } catch (error) {
    console.error('❌ Error handling pet purchase event:', error);
  }
}


const getProgram = (connection: Connection) => {
  return new anchor.Program(idl, {
    connection: new anchor.web3.Connection(connection.rpcEndpoint),
  });
}