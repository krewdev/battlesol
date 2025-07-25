# Battle Sol Smart Contracts

This directory contains the Solana smart contracts for Battle Sol, implementing provably fair gameplay and the $SHIP token presale.

## Contracts Overview

### 1. Provably Fair Gaming Contract
- **Purpose**: Ensures fair gameplay through cryptographic commitments
- **Features**:
  - Commit-reveal scheme for ship positions
  - On-chain randomness generation
  - Automatic prize distribution
  - Game state verification

### 2. $SHIP Token Presale Contract
- **Purpose**: Manages the presale of $SHIP tokens
- **Features**:
  - Phased pricing with bonuses
  - Supply caps and time limits
  - Automatic token minting
  - SOL collection and management

## Quick Start

### Prerequisites
- Rust 1.70+
- Solana CLI 1.16+
- Anchor Framework 0.29+
- Node.js 18+

### Installation

1. Install Anchor CLI:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

2. Install dependencies:
```bash
npm install
```

### Building

```bash
anchor build
```

### Testing

```bash
anchor test
```

### Deployment

1. Configure your wallet and cluster:
```bash
solana config set --keypair ~/.config/solana/id.json
solana config set --url https://api.devnet.solana.com
```

2. Deploy to devnet:
```bash
anchor deploy --provider.cluster devnet
```

3. For mainnet deployment:
```bash
anchor deploy --provider.cluster mainnet-beta
```

## Contract Addresses

### Devnet
- Program ID: `BattLeSoLGaMeSmArTcOnTrAcTsPrOvAbLyFaIr111111`

### Mainnet
- Program ID: `TBD` (To be deployed)

## Contract Functions

### Game Contract

#### `initialize(authority: Pubkey)`
Initializes the game program with the given authority.

#### `create_game(wager_amount: u64, player_commitment: [u8; 32])`
Creates a new game with the specified wager and player commitment.

#### `join_game(opponent_commitment: [u8; 32])`
Allows a second player to join an existing game.

#### `reveal_and_finalize(player_ships: Vec<ShipPosition>, player_nonce: u64, opponent_ships: Vec<ShipPosition>, opponent_nonce: u64, winner: GameWinner)`
Reveals ship positions and finalizes the game with winner determination.

### Presale Contract

#### `initialize_presale(presale_price: u64, max_supply: u64, start_time: i64, end_time: i64)`
Initializes the $SHIP token presale with specified parameters.

#### `buy_ship_tokens(amount: u64)`
Allows users to purchase $SHIP tokens during the presale.

## Security Features

- **Commit-Reveal Scheme**: Prevents cheating by requiring cryptographic commitments
- **Time-locked Operations**: Ensures proper game flow and prevents manipulation
- **Access Controls**: Only authorized accounts can perform sensitive operations
- **Overflow Protection**: All math operations are checked for overflows
- **Reentrancy Guards**: Prevents reentrancy attacks

## Game Flow

1. **Commitment Phase**: Both players submit hashes of their ship positions
2. **Gameplay**: Game is played with committed positions (off-chain for UX)
3. **Reveal Phase**: Players reveal their actual ship positions and nonces
4. **Verification**: Smart contract verifies commitments match revealed data
5. **Prize Distribution**: Winner receives the prize pool automatically

## Token Economics

- **Total Supply**: 100,000,000 $SHIP
- **Presale Allocation**: 10,000,000 $SHIP (10%)
- **Presale Phases**: 4 phases with decreasing bonuses
- **House Edge**: 2.5% on all games

## Development

### Running Tests

```bash
# Run all tests
anchor test

# Run specific test file
anchor test --skip-lint tests/game-test.ts
```

### Adding New Features

1. Update the program in `src/lib.rs`
2. Add corresponding tests in `tests/`
3. Update the TypeScript client code
4. Test thoroughly on devnet before mainnet deployment

## Audit Status

- [ ] Initial development complete
- [ ] Internal security review
- [ ] External audit (planned)
- [ ] Mainnet deployment

## License

This project is licensed under the MIT License.

## Support

For technical support or questions:
- Discord: [Battle Sol Community]
- Email: dev@battlesol.io
- GitHub Issues: [Create an issue]