import { getKeypairFromFile } from "@solana-developers/helpers";
import { ExtensionType, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, getMintLen, getOrCreateAssociatedTokenAccount, getTokenMetadata, mintTo } from "@solana/spl-token";
import { TokenMetadata, createInitializeInstruction, createUpdateFieldInstruction, pack } from "@solana/spl-token-metadata";
import { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

// Use 'npx esrun mint.ts' to run this script, remember to install dependencies.
// Source: https://www.youtube.com/watch?v=l7EyQUlNAdw

// Change connection as necessary
const connection = new Connection(clusterApiUrl("devnet"))

// Change file path as neccessary 
const payer = await getKeypairFromFile("~/.config/solana/id.json")
console.log("payer", payer.publicKey.toBase58())

const mint = Keypair.generate()

// Logging mint publickey/address
console.log("mint pubkey\n", mint.publicKey.toBase58())
// Consider saving the mint secretkey if necessary, or for documentation.
console.log("mint secret key\n", mint.secretKey)

// Modify token metadata as neccessary
const metadata : TokenMetadata = {
    mint: mint.publicKey,
    name: "Coin-ani",
    symbol: "PH",
    uri: "https://nyksppoly.github.io/FYP_token_info/json/coin-ani-90.json",
    additionalMetadata: [
        ['placeholder key', 'placeholder value']
    ],
}

const mintSpace = getMintLen([
    ExtensionType.MetadataPointer
])

const metadataSpace = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length

const lamports = await connection.getMinimumBalanceForRentExemption(
    mintSpace + metadataSpace
)

const createAccountsIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    space: mintSpace,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID
})

const initializeMetadataPointerIx = createInitializeMetadataPointerInstruction(
    mint.publicKey,
    payer.publicKey,
    mint.publicKey,
    TOKEN_2022_PROGRAM_ID
)

const initializeMintIx = createInitializeMintInstruction(
    mint.publicKey,
    2, // decimals for the token, change as necessary
    payer.publicKey,
    null,
    TOKEN_2022_PROGRAM_ID
)

// Additional metadata will be added in another instruction (updateMetadataField instruction below)
const initializeMetadataIx = createInitializeInstruction({
    mint: mint.publicKey,
    metadata: mint.publicKey,
    mintAuthority: payer.publicKey,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    programId: TOKEN_2022_PROGRAM_ID,
    updateAuthority: payer.publicKey
})

const updateMetadataField = createUpdateFieldInstruction({
    metadata: mint.publicKey,
    programId: TOKEN_2022_PROGRAM_ID,
    updateAuthority: payer.publicKey,
    // Add additional fields and values if neccessary eg: [1][0] and [1][1]
    field: metadata.additionalMetadata[0][0],
    value: metadata.additionalMetadata[0][1]
})

const transaction = new Transaction().add(
    createAccountsIx,
    initializeMetadataPointerIx,
    initializeMintIx,
    initializeMetadataIx,
    updateMetadataField
)

const sig = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer,mint]
)

console.log("sig: ", sig);
// If there are no errors, minting is now complete and the token has been created with the following address.
console.log("mint pubkey\n", mint.publicKey)

// for minting newly created tokens to the mint authority

// const tokenaccount = await getOrCreateAssociatedTokenAccount(
//     connection,
//     payer,
//     mint.publicKey,
//     payer.publicKey
// )

// console.log(tokenaccount)

// const minttoacc = await mintTo(
//     connection,
//     payer,
//     mint.publicKey,
//     tokenaccount,
//     payer.publicKey,
//     100 // amount you with to mint, multiply by decimals in the token.
// )