export interface Player {
  id: string
  name: string
  created_at: string
}

export type GameStatus = 'active' | 'finalized' | 'cancelled'
export type PaymentStatus = 'paid' | 'unpaid'

export interface Game {
  id: string
  date: string
  time: string
  venue_name: string
  venue_address: string | null
  total_cost: number | null
  max_players: number
  status: GameStatus
  join_code: string
  created_by: string
  created_at: string
  updated_at: string
  organiser?: Player
  player_count?: number
  is_joined?: boolean
  spots_left?: number
  per_player_cost?: number | null
  current_player_entry?: GamePlayer | null
}

export interface GamePlayer {
  id: string
  game_id: string
  player_id: string
  payment_status: PaymentStatus
  payment_amount: number | null
  payment_date: string | null
  joined_at: string
  player?: Player
}

export interface GameDetail extends Game {
  players: (GamePlayer & { player: Player })[]
}
