import { Ball } from "./Ball";
import { Player } from "./Player";

export function collision(ball: Ball, player: Player, one: boolean): boolean {
  const b_top = ball.y - ball.radius;
  const b_bottom = ball.y + ball.radius;
  const b_left = ball.x - ball.radius;
  const b_right = ball.x + ball.radius;

  const p_top = player.y;
  const p_bottom = player.y + player.height;
  const p_right = player.x + player.width;
  const p_left = player.x;

  if (one) return b_bottom >= p_top && b_left <= p_right && b_top <= p_bottom;
  return b_bottom >= p_top && b_right >= p_left && b_top <= p_bottom;
}

export function lerp(a: number, b: number, p: number) {
  return a + (b - a) * (p / 100);
}
