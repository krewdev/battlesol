use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use solana_program::hash::hash;
use solana_program::clock::Clock;

declare_id!("11111111111111111111111111111112");

#[program]
pub mod battle_sol_contracts {
    use super::*;

    // Initialize the game program
    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let game_config = &mut ctx.accounts.game_config;
        game_config.authority = authority;
        game_config.total_games = 0;
        game_config.total_volume = 0;
        game_config.house_edge = 250; // 2.5% in basis points
        game_config.is_paused = false;
        game_config.bump = ctx.bumps.game_config;
        Ok(())
    }

    // Initialize $SHIP token presale
    pub fn initialize_presale(
        ctx: Context<InitializePresale>,
        presale_price: u64, // Price per token in lamports
        max_supply: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        presale.authority = ctx.accounts.authority.key();
        presale.mint = ctx.accounts.ship_mint.key();
        presale.presale_price = presale_price;
        presale.max_supply = max_supply;
        presale.total_sold = 0;
        presale.start_time = start_time;
        presale.end_time = end_time;
        presale.is_active = true;
        presale.bump = ctx.bumps.presale;
        Ok(())
    }

    // Purchase $SHIP tokens during presale
    pub fn buy_ship_tokens(ctx: Context<BuyShipTokens>, amount: u64) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        let clock = Clock::get()?;

        require!(presale.is_active, GameError::PresaleNotActive);
        require!(clock.unix_timestamp >= presale.start_time, GameError::PresaleNotStarted);
        require!(clock.unix_timestamp <= presale.end_time, GameError::PresaleEnded);
        require!(presale.total_sold + amount <= presale.max_supply, GameError::ExceedsMaxSupply);

        let total_cost = amount
            .checked_mul(presale.presale_price)
            .ok_or(GameError::MathOverflow)?;

        // Transfer SOL from buyer to presale vault
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.presale_vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );
        anchor_lang::system_program::transfer(cpi_ctx, total_cost)?;

        // Mint SHIP tokens to buyer
        let seeds = &[
            b"presale".as_ref(),
            &[presale.bump],
        ];
        let signer = &[&seeds[..]];

        let mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.ship_mint.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: presale.to_account_info(),
            },
            signer,
        );
        token::mint_to(mint_ctx, amount)?;

        presale.total_sold = presale.total_sold
            .checked_add(amount)
            .ok_or(GameError::MathOverflow)?;

        emit!(TokensPurchased {
            buyer: ctx.accounts.buyer.key(),
            amount,
            total_cost,
        });

        Ok(())
    }

    // Create a new provably fair game
    pub fn create_game(
        ctx: Context<CreateGame>,
        wager_amount: u64,
        player_commitment: [u8; 32], // Hash of player's ship positions + nonce
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let game_config = &mut ctx.accounts.game_config;
        let clock = Clock::get()?;

        require!(!game_config.is_paused, GameError::GamesPaused);
        require!(wager_amount > 0, GameError::InvalidWager);

        // Generate server seed for randomness
        let mut seed_data = Vec::new();
        seed_data.extend_from_slice(&clock.unix_timestamp.to_le_bytes());
        seed_data.extend_from_slice(&clock.slot.to_le_bytes());
        seed_data.extend_from_slice(&ctx.accounts.player.key().to_bytes());
        seed_data.extend_from_slice(&game_config.total_games.to_le_bytes());
        let server_seed = hash(&seed_data);

        game.player = ctx.accounts.player.key();
        game.wager_amount = wager_amount;
        game.player_commitment = player_commitment;
        game.server_seed = server_seed.to_bytes();
        game.game_state = GameState::WaitingForOpponent;
        game.created_at = clock.unix_timestamp;
        game.game_id = game_config.total_games;
        game.bump = ctx.bumps.game;

        // Transfer wager to game vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player_token_account.to_account_info(),
                to: ctx.accounts.game_vault.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, wager_amount)?;

        game_config.total_games = game_config.total_games
            .checked_add(1)
            .ok_or(GameError::MathOverflow)?;

        emit!(GameCreated {
            game_id: game.game_id,
            player: game.player,
            wager_amount,
        });

        Ok(())
    }

    // Join an existing game
    pub fn join_game(
        ctx: Context<JoinGame>,
        opponent_commitment: [u8; 32],
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(game.game_state == GameState::WaitingForOpponent, GameError::InvalidGameState);
        require!(game.player != ctx.accounts.opponent.key(), GameError::CannotPlaySelf);

        // Transfer wager from opponent
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.opponent_token_account.to_account_info(),
                to: ctx.accounts.game_vault.to_account_info(),
                authority: ctx.accounts.opponent.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, game.wager_amount)?;

        game.opponent = Some(ctx.accounts.opponent.key());
        game.opponent_commitment = Some(opponent_commitment);
        game.game_state = GameState::InProgress;

        emit!(GameJoined {
            game_id: game.game_id,
            opponent: ctx.accounts.opponent.key(),
        });

        Ok(())
    }

    // Reveal ship positions and determine winner
    pub fn reveal_and_finalize(
        ctx: Context<RevealAndFinalize>,
        player_ships: Vec<ShipPosition>,
        player_nonce: u64,
        opponent_ships: Vec<ShipPosition>,
        opponent_nonce: u64,
        winner: GameWinner,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let game_config = &ctx.accounts.game_config;

        require!(game.game_state == GameState::InProgress, GameError::InvalidGameState);

        // Verify player commitment
        let mut player_data = Vec::new();
        player_data.extend_from_slice(&serialize_ships(&player_ships));
        player_data.extend_from_slice(&player_nonce.to_le_bytes());
        let player_hash = hash(&player_data);
        require!(player_hash.to_bytes() == game.player_commitment, GameError::InvalidCommitment);

        // Verify opponent commitment if exists
        if let Some(opponent_commitment) = game.opponent_commitment {
            let mut opponent_data = Vec::new();
            opponent_data.extend_from_slice(&serialize_ships(&opponent_ships));
            opponent_data.extend_from_slice(&opponent_nonce.to_le_bytes());
            let opponent_hash = hash(&opponent_data);
            require!(opponent_hash.to_bytes() == opponent_commitment, GameError::InvalidCommitment);
        }

        // Calculate house edge
        let total_wager = game.wager_amount
            .checked_mul(2)
            .ok_or(GameError::MathOverflow)?;
        let house_fee = total_wager
            .checked_mul(game_config.house_edge as u64)
            .ok_or(GameError::MathOverflow)?
            .checked_div(10000)
            .ok_or(GameError::MathOverflow)?;
        let prize_pool = total_wager
            .checked_sub(house_fee)
            .ok_or(GameError::MathOverflow)?;

        // Distribute winnings
        let seeds = &[
            b"game".as_ref(),
            &(game.game_id as u32).to_le_bytes(),
            &[game.bump],
        ];
        let signer = &[&seeds[..]];

        match winner {
            GameWinner::Player => {
                let transfer_ctx = CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.game_vault.to_account_info(),
                        to: ctx.accounts.player_token_account.to_account_info(),
                        authority: game.to_account_info(),
                    },
                    signer,
                );
                token::transfer(transfer_ctx, prize_pool)?;
            },
            GameWinner::Opponent => {
                if let Some(_opponent) = game.opponent {
                    let transfer_ctx = CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.game_vault.to_account_info(),
                            to: ctx.accounts.opponent_token_account.to_account_info(),
                            authority: game.to_account_info(),
                        },
                        signer,
                    );
                    token::transfer(transfer_ctx, prize_pool)?;
                }
            },
            GameWinner::Draw => {
                // Return wagers to both players
                let half_wager = game.wager_amount;
                
                let transfer_to_player = CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.game_vault.to_account_info(),
                        to: ctx.accounts.player_token_account.to_account_info(),
                        authority: game.to_account_info(),
                    },
                    signer,
                );
                token::transfer(transfer_to_player, half_wager)?;

                if game.opponent.is_some() {
                    let transfer_to_opponent = CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.game_vault.to_account_info(),
                            to: ctx.accounts.opponent_token_account.to_account_info(),
                            authority: game.to_account_info(),
                        },
                        signer,
                    );
                    token::transfer(transfer_to_opponent, half_wager)?;
                }
            },
        }

        game.game_state = GameState::Finished;
        game.winner = Some(winner);
        game.player_ships = Some(player_ships);
        game.opponent_ships = if game.opponent.is_some() { Some(opponent_ships) } else { None };

        emit!(GameFinalized {
            game_id: game.game_id,
            winner,
            prize_pool,
            house_fee,
        });

        Ok(())
    }

    // Emergency pause games (authority only)
    pub fn pause_games(ctx: Context<PauseGames>) -> Result<()> {
        let game_config = &mut ctx.accounts.game_config;
        game_config.is_paused = true;
        Ok(())
    }

    // Resume games (authority only)
    pub fn resume_games(ctx: Context<ResumeGames>) -> Result<()> {
        let game_config = &mut ctx.accounts.game_config;
        game_config.is_paused = false;
        Ok(())
    }
}

// Account structures
#[account]
pub struct GameConfig {
    pub authority: Pubkey,
    pub total_games: u64,
    pub total_volume: u64,
    pub house_edge: u16, // In basis points (e.g., 250 = 2.5%)
    pub is_paused: bool,
    pub bump: u8,
}

#[account]
pub struct Presale {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub presale_price: u64, // Price per token in lamports
    pub max_supply: u64,
    pub total_sold: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
pub struct Game {
    pub player: Pubkey,
    pub opponent: Option<Pubkey>,
    pub wager_amount: u64,
    pub player_commitment: [u8; 32],
    pub opponent_commitment: Option<[u8; 32]>,
    pub server_seed: [u8; 32],
    pub game_state: GameState,
    pub winner: Option<GameWinner>,
    pub player_ships: Option<Vec<ShipPosition>>,
    pub opponent_ships: Option<Vec<ShipPosition>>,
    pub created_at: i64,
    pub game_id: u64,
    pub bump: u8,
}

// Enums and structs
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameState {
    WaitingForOpponent,
    InProgress,
    Finished,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum GameWinner {
    Player,
    Opponent,
    Draw,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ShipPosition {
    pub ship_id: u8,
    pub positions: Vec<GridPosition>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GridPosition {
    pub row: u8,
    pub col: u8,
}

// Context structs
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 2 + 1 + 1,
        seeds = [b"config"],
        bump
    )]
    pub game_config: Account<'info, GameConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializePresale<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"presale"],
        bump
    )]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = presale,
    )]
    pub ship_mint: Account<'info, Mint>,
    #[account(mut)]
    /// CHECK: This is the presale vault that will receive SOL
    pub presale_vault: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyShipTokens<'info> {
    #[account(
        mut,
        seeds = [b"presale"],
        bump = presale.bump
    )]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        mint::authority = presale,
    )]
    pub ship_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = ship_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    /// CHECK: This is the presale vault that will receive SOL
    pub presale_vault: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + 32 + 33 + 8 + 32 + 33 + 32 + 1 + 1 + 500 + 500 + 8 + 8 + 1,
        seeds = [b"game", &(game_config.total_games as u32).to_le_bytes()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    pub ship_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = player,
        token::mint = ship_mint,
        token::authority = game,
    )]
    pub game_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct JoinGame<'info> {
    #[account(
        mut,
        seeds = [b"game", &game_id.to_le_bytes()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub opponent: Signer<'info>,
    #[account(mut)]
    pub opponent_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub game_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct RevealAndFinalize<'info> {
    #[account(
        mut,
        seeds = [b"game", &game_id.to_le_bytes()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    #[account(
        seeds = [b"config"],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,
    /// CHECK: Either player or opponent can call this
    pub caller: Signer<'info>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub opponent_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub game_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PauseGames<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = game_config.bump,
        has_one = authority
    )]
    pub game_config: Account<'info, GameConfig>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResumeGames<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = game_config.bump,
        has_one = authority
    )]
    pub game_config: Account<'info, GameConfig>,
    pub authority: Signer<'info>,
}

// Events
#[event]
pub struct TokensPurchased {
    pub buyer: Pubkey,
    pub amount: u64,
    pub total_cost: u64,
}

#[event]
pub struct GameCreated {
    pub game_id: u64,
    pub player: Pubkey,
    pub wager_amount: u64,
}

#[event]
pub struct GameJoined {
    pub game_id: u64,
    pub opponent: Pubkey,
}

#[event]
pub struct GameFinalized {
    pub game_id: u64,
    pub winner: GameWinner,
    pub prize_pool: u64,
    pub house_fee: u64,
}

// Errors
#[error_code]
pub enum GameError {
    #[msg("Presale is not active")]
    PresaleNotActive,
    #[msg("Presale has not started yet")]
    PresaleNotStarted,
    #[msg("Presale has ended")]
    PresaleEnded,
    #[msg("Amount exceeds maximum supply")]
    ExceedsMaxSupply,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Games are currently paused")]
    GamesPaused,
    #[msg("Invalid wager amount")]
    InvalidWager,
    #[msg("Invalid game state")]
    InvalidGameState,
    #[msg("Cannot play against yourself")]
    CannotPlaySelf,
    #[msg("Invalid commitment")]
    InvalidCommitment,
}

// Helper functions
fn serialize_ships(ships: &[ShipPosition]) -> Vec<u8> {
    let mut result = Vec::new();
    for ship in ships {
        result.push(ship.ship_id);
        result.push(ship.positions.len() as u8);
        for pos in &ship.positions {
            result.push(pos.row);
            result.push(pos.col);
        }
    }
    result
}