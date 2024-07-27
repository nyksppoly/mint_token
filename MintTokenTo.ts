import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { mintTo, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { getKeypairFromFile } from "@solana-developers/helpers";

export function MintTokenTo(reciever, decimals) {
    (async () => {
        decimals = decimals * 100 // multiplying decimals to mint with decimals in the token, change as needed
        // Converting string pubkey to valid pubkey
        const recipientpubkey = new PublicKey(reciever);

        // Connect to cluster
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

        // Generate mint authority keypair, change as needed
        const payer = await getKeypairFromFile("~/.config/solana/id.json")

        // Assign token mint
        // ------------------------------------------- REPLACE THIS WITH YOUR OWN MINT TOKEN PUBKEY ----------------------------------------------------
        const mint = new PublicKey('9EoExkguECXxPRZpWYQ5L18CjoMMP2HFWSB2vJ5PRiSC');

        // Get the token account of the recipient address, and if it does not exist, create it
        const recipientAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            recipientpubkey,
            undefined,
            undefined,
            undefined,
            TOKEN_2022_PROGRAM_ID,
        );

        // Mint specified new tokens to the "recipientAccount" payer's token account we just created
        let signature = await mintTo(
            connection,
            payer,
            mint,
            recipientAccount.address,
            payer.publicKey,
            decimals,
            undefined,
            undefined,
            TOKEN_2022_PROGRAM_ID
        );
        return signature;
    })();
};

// Change as neccessary. Use 'npx esrun MintTokenTo.ts' to run script, remember to install dependencies.
// console.log(MintTokenTo("HLwVET8o4cP5GVGsNXCsZQJPMCELyJ4fnrTjxQz2NE61",10))