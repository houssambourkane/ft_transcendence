export interface Ball {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  velocityX: number;
  velocityY: number;
  maxX: number;
  maxY: number;
  color: string;
  reverseColor: string;
  stop: boolean;
}

export function createBall(
  canvas: HTMLCanvasElement,
  ballColor: string,
  ballReverse: string
): Ball {
  let ball: Ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    speedX: 5, // 1 to 100
    speedY: 15, // 1 to 100
    velocityX: 0,
    velocityY: 0,
    maxX: 20, // max speed X from 10 to 50
    maxY: 30, // max speed Y from 10 to 50
    color: ballColor,
    reverseColor: ballReverse,
    stop: true,
  };
  if (Math.random() > 0.5) ball.velocityX = 5;
  else ball.velocityX = -5;
  while (ball.velocityY * 10 < 10 && ball.velocityY * 10 > -10) {
    if (Math.random() > 0.5) ball.velocityY = (Math.random() * 10) % 5;
    else ball.velocityY = (-1 * (Math.random() * 10)) % 5;
  }

  return ball;
}
