use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use pyth_sdk_solana::{load_price_feed_from_account_info, PriceFeed};

declare_id!("SANDW1CHPr00f11111111111111111111111111");

#[program]
pub mod sandwich_resistant_swap {
    use super::*;

    pub fn swap_with_protection(
        ctx: Context<SwapWithProtection>,
        amount_in: u64,
        min_amount_out: u64,
        max_slippage_bps: u16,     // Slippage in basis points (1% = 100)
        valid_until: i64,          // Unix timestamp after which tx is invalid
    ) -> Result<()> {
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp <= valid_until,
            SwapError::TransactionExpired
        );

        // Load oracle price
        let price_feed = load_price_feed_from_account_info(&ctx.accounts.oracle)?;
        let price_data = price_feed.get_current_price().ok_or(SwapError::InvalidPrice)?;
        let oracle_price = price_data.price as u128;

        // Calculate expected output using oracle price
        let expected_output = (amount_in as u128)
            .checked_mul(oracle_price)
            .ok_or(SwapError::ArithmeticOverflow)?;

        // Calculate allowed slippage
        let max_slippage = expected_output
            .checked_mul(max_slippage_bps as u128)
            .ok_or(SwapError::ArithmeticOverflow)?
            / 10_000;

        let minimum_acceptable_output = expected_output
            .checked_sub(max_slippage)
            .ok_or(SwapError::ArithmeticOverflow)?;

        require!(
            minimum_acceptable_output >= min_amount_out as u128,
            SwapError::SlippageExceeded
        );

        // Safe token transfer (from user to pool)
        token::transfer(ctx.accounts.transfer_ctx(), amount_in)?;

        // NOTE: Swap logic would go here (DEX integration, etc.)

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SwapWithProtection<'info> {
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,

    /// CHECK: Oracle account from Pyth or other trusted oracle
    pub oracle: AccountInfo<'info>,
}

impl<'info> SwapWithProtection<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.user_token_account.to_account_info(),
                to: self.pool_token_account.to_account_info(),
                authority: self.user.to_account_info(),
            },
        )
    }
}

#[error_code]
pub enum SwapError {
    #[msg("Transaction has expired.")]
    TransactionExpired,
    #[msg("Invalid oracle price.")]
    InvalidPrice,
    #[msg("Calculated slippage exceeds allowed threshold.")]
    SlippageExceeded,
    #[msg("Arithmetic overflow occurred.")]
    ArithmeticOverflow,
}
